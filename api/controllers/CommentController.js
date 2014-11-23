/**
 * CommentController
 *
 * @description :: Server-side logic for managing comments
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	inactivateComment: function(req, res){
		if(!req.param('id')) return res.badRequest();

		Comment.inactive(req.param('id'), function(err, comment){
			if(err) return res.serverError(err);
			res.ok(comment);
		});
	}
	
};

