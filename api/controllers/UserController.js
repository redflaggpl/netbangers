/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var bcrypt = require('bcrypt');

module.exports = {

	create: function(req, res){
		// res.send(200, {status:"OK", results:"por el create"});
		if(!req.param('name') || !req.param('email') || !req.param('password')) {
			res.badRequest(res.__('bad'));
		} else {
			var params = {
				name: req.param('name'),
				email: req.param('email'),
				password: req.param('password')
			};
			User.create(params, function(err, createdUser){
				if(err)
					return res.send(400, err);
				else
					return res.ok(createdUser);
			});
		}
	},

	find: function(req, res){
		User.find()
    .populate('comments', {active: 1})
    .exec(function(err, users){
      res.ok(users);
    });
	},

	login: function(req, res){
		if(!req.param('doLogin')){
			console.log('fail');
			res.view({message:false});
		} else {
			User.findOne()
			.where({email:req.param('email')})
			.exec(function(err, userFound){
				console.log(userFound);
				if(err) return res.serverError(err);
				if(userFound){
					bcrypt.compare(req.param('password'), userFound.password, function(err, result){
						if(err) return res.serverError(err);
						if(result){
							console.log("authenticated");
							req.session.authenticated = true;
							return res.redirect('/user');
						} else {
							res.view({message:"No coincide el password"});
						}
					});
				} else {
					res.view({message:"No existe el usuario"});
				}
			});
		}
	}
};

