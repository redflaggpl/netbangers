/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var bcrypt = require('bcrypt');

module.exports = {

  attributes: {
  	name: {
  		type: 'string',
  		required: true
  	},
  	email: {
  		type: 'string',
  		required: true,
  		email: true,
      unique: true
    },
    genre: 'string',
    password: {
      type: 'string',
      required: true
    },
    commentsCounter: {
      type: 'integer',
      defaultsTo: 0
    },
    comments: {
      collection:'comment',
      via: 'creatorID'
    },
    toJSON: function () {
      var obj = this.toObject();
      // Remove the password object value
      delete obj.password;
      //delete obj.passcode;
      // return the new object without password
      return obj;
    }
  },

  beforeCreate: function(values, next) {
    console.log(values);
    bcrypt.hash(values.password, 10, function(err, hash) {
      if(err) return next(err);
      values.password = hash;
      next();
    });
  },
  updateCommentsCounter: function(params, next){
    console.log("params",params);
    User.findOne()
    .where({id:params.id})
    .exec(function(err, user){
      User.update(
        {id:user.id},
        {commentsCounter: user.commentsCounter+parseInt(params.operator)})
      .exec(function(err, data){
        if(err) return next(err);
        next(null);
      });
    });
  }
};

