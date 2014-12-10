var oauth2orize         = require('oauth2orize'),
    passport            = require('passport'),
    login               = require('connect-ensure-login'),
    bcrypt              = require('bcrypt'),
    trustedClientPolicy = require('../api/policies/isTrustedClient.js');

// Create OAuth 2.0 server
var server = oauth2orize.createServer();

server.serializeClient(function(client, done) {
  return done(null, client.id);
});

server.deserializeClient(function(id, done) {
Client.findOne(id, function(err, client) {
  if (err) { return done(err); }
    return done(null, client);
  });
});

// Generate authorization code
server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
  AuthCode.create({
                    clientId: client.clientId,
                    redirectURI: redirectURI,
                    userId: user.id,
                    scope: ares.scope
                  }).done(function(err,code){
                    if(err){return done(err,null);}
                    return done(null,code.code);
                  });
}));

// Generate access token for Implicit flow
// Only access token is generated in this flow, no refresh token is issued
server.grant(oauth2orize.grant.token(function(client, user, ares, done) {
  AccessToken.destroy({ userId: user.id, clientId: client.clientId }, function (err) {
    if (err){
      return done(err);
    } else {
      AccessToken.create({ userId: user.id, clientId: client.clientId }, function(err, accessToken){
        if(err) {
          return done(err);
        } else {
          return done(null, accessToken.token);
        }
      });
    }
  });
}));

// Exchange authorization code for access token
server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  AuthCode.findOne({
                     code: code
                   }).done(function(err,code){
                     if(err || !code) {
                       return done(err);
                     }
                     if (client.clientId !== code.clientId) {
                       return done(null, false);
                     }
                     if (redirectURI !== code.redirectURI) {
                       return done(null, false);
                     }

                     // Remove Refresh and Access tokens and create new ones
                     RefreshToken.destroy({ userId: code.userId, clientId: code.clientId }, function (err) {
                       if (err) {
                         return done(err);
                       } else {
                         AccessToken.destroy({ userId: code.userId, clientId: code.clientId }, function (err) {
                           if (err){
                             return done(err);
                           } else {
                             RefreshToken.create({ userId: code.userId, clientId: code.clientId }, function(err, refreshToken){
                               if(err){
                                 return done(err);
                               } else {
                                 AccessToken.create({ userId: code.userId, clientId: code.clientId }, function(err, accessToken){
                                   if(err) {
                                     return done(err);
                                   } else {
                                     return done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.appConfig.oauth.tokenLife });
                                   }
                                 });
                               }
                             });
                           }
                         });
                       }
                     });

                   });
}));

// Exchange username & password for access token.
server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
      console.log("username", username);
      console.log("password", password);
    User.findOne({ email: username })
    // .where({active:1})
    .exec(function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }

        var pwdCompare = bcrypt.compareSync(password, user.password);
        console.log("pwdCompare", pwdCompare);
        if(!pwdCompare){ return done( null, false) };

        AccessToken.findOne({userId: user.id}, function(err, accessToken){
          if (err) {
            return done(err);
          } else{

            if(accessToken && (new Date(accessToken.createdAt.getTime() + 1000 * sails.config.appConfig.oauth.tokenLife) > new Date())){

              RefreshToken.findOne({ userId: user.id, clientId: client.clientId }, function(err, refreshToken) {
                if (err) {
                  return done(err);
                } else {
                  var expires = ((accessToken.createdAt.getTime() + 1000 * sails.config.appConfig.oauth.tokenLife) - new Date().getTime())/1000
                  done(null, accessToken.token, refreshToken.token, { 'expires_in': expires });
                }
              });

            } else{

              // Remove Refresh and Access tokens and create new ones
              RefreshToken.destroy({ userId: user.id, clientId: client.clientId }, function (err) {
                  if (err) {
                    return done(err);
                  } else {
                    AccessToken.destroy({ userId: user.id, clientId: client.clientId }, function (err) {
                      if (err){
                        return done(err);
                      } else {
                        RefreshToken.create({ userId: user.id, clientId: client.clientId }, function(err, refreshToken){
                          if(err){
                            return done(err);
                          } else {
                            AccessToken.create({ userId: user.id, clientId: client.clientId }, function(err, accessToken){
                              if(err) {
                                return done(err);
                              } else {
                                done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.appConfig.oauth.tokenLife });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
              });

            }
          }
        });

    });
}));

// Exchange refreshToken for access token.
server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {

    RefreshToken.findOne({ token: refreshToken }, function(err, token) {

        if (err) { return done(err); }
        if (!token) { return done(null, false); }
        if (!token) { return done(null, false); }

        User.findOne({id: token.userId}, function(err, user) {

            if (err) { return done(err); }
            if (!user) { return done(null, false); }

            // Remove Refresh and Access tokens and create new ones
            RefreshToken.destroy({ userId: user.id, clientId: client.clientId }, function (err) {
              if (err) {
                return done(err);
              } else {
                AccessToken.destroy({ userId: user.id, clientId: client.clientId }, function (err) {
                  if (err){
                    return done(err);
                  } else {
                    RefreshToken.create({ userId: user.id, clientId: client.clientId }, function(err, refreshToken){
                      if(err){
                        return done(err);
                      } else {
                        AccessToken.create({ userId: user.id, clientId: client.clientId }, function(err, accessToken){
                          if(err) {
                            return done(err);
                          } else {
                            done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.appConfig.oauth.tokenLife });
                          }
                        });
                      }
                    });
                  }
                });
              }
           });
        });
    });
}));

module.exports = {
 http: {
    customMiddleware: function(app){

      // Initialize passport
      app.use(passport.initialize());
      app.use(passport.session());

      /***** OAuth authorize endPoints *****/

      app.get('/oauth/authorize',
        login.ensureLoggedIn(),
        server.authorize(function(clientId, redirectURI, done) {

          Client.findOne({clientId: clientId}, function(err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.redirectURI != redirectURI) { return done(null, false); }
            return done(null, client, client.redirectURI);
          });
        }),
        server.errorHandler(),
        function(req, res) {
          res.render('dialog', { transactionID: req.oauth2.transactionID,
                                 user: req.user,
                                 client: req.oauth2.client
          });
        }
      );

      app.post('/oauth/authorize/decision',
        login.ensureLoggedIn(),
        server.decision());

      /***** OAuth token endPoint *****/
      app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
      });

      app.post('/oauth/token',
        trustedClientPolicy,
        passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
        server.token(),
        server.errorHandler()
      );


    }
 }
};
