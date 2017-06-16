var mongoose = require('mongoose'),
    schema = mongoose.Schema,
    commentSchema = new schema({
        date: {type:String, required:true},
        owner: {type:String, required:true},
        content: {type:String, required:true}
    }, {collection: 'comments'});


var Comment = commentSchema; 

module.exports = Comment;