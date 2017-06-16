var mongoose = require('mongoose'),
    Comment = require('./comment.js'),
    ObjectIdSchema = mongoose.Schema.ObjectId,
    ObjectId = mongoose.Types.ObjectId,
    schema = mongoose.Schema,
    statusSchema = new schema({
        _id:  {type:ObjectIdSchema, default: function () { return new ObjectId()} },
        date: {type:String, required:true},
        content: {type:String, required:true},
        tweets: {type: Number, default: 0},
        likes: {type: Number, default: 0},
        comments: [Comment]
    }, {collection: 'statuses'});


var Status = statusSchema; 

module.exports = Status;