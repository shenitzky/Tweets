var mongoose = require('mongoose'),
    Comment = require('./comment.js'),
    schema = mongoose.Schema,
    postSchema = new schema({
        title: {type:String, required:true},
        date: {type:String, required:true},
        mainImgUrl: {type:String, required:true},
        contentImgsUrl: [String],
        content: {type:String, required:true},
        comments: [Comment]
    }, {collection: 'posts'});
 
var Post = mongoose.model('Post', postSchema); 

module.exports = Post;