var mongoose = require('mongoose'),
    status = require('./status.js'),
    schema = mongoose.Schema,
    userSchema = new schema({
        userName: {type:String, required:true, unique:true},
        password: {type:String, required:true},
        imgUrl: {type:String, required:true},
        statuses: [status]
    }, {collection: 'users'});


var User = mongoose.model('User', userSchema); 

module.exports = User;