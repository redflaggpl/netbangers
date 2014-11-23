/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

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
	}	
};

