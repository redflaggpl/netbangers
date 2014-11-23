/**
* Comment.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	creatorID: {
  		model: 'user'
  	},
  	comment: {
  		type: 'string',
  		required: true
  	},
    active: {
      type: 'integer',
      defaultsTo: 1
    }
  },

  afterCreate: function(comment, next){
    User.updateCommentsCounter({id:comment.creatorID, operator:1}, function(err, updated){
      next();
    });
  },

  inactive: function(id, next){
    Comment.update({id:id}, {active:0})
    .exec(function(err, comment){

      if(err) return next(err);
      User.updateCommentsCounter({id:comment[0].creatorID, operator:-1}, function(err, updated){
        next(null, comment[0]);
      });
    });
  }
};
