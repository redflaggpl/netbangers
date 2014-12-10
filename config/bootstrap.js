/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

 
  Client.findOrCreate({"name" : "netbangers-web"},
  {
    "name" : "netbangers-web",
    "redirectURI" : "http://localhost:1338",
    "trusted" : true,
    "clientId" : "9F7B4M4HO1",
    "clientSecret" : "1lZFK0Qy4aioephpFypzaS5oZtx221"
	}, function(err, client){
		if(err) console.log(err);
		else console.log(client);
	});

  cb();
};
