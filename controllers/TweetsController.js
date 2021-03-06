const mongoose  =   require('mongoose'),
      conn      =   require('../database'),
      url       =   require('url'),
      Post      =   require('../models/post'),
      Status    =   require('../models/status'),
      ObjectId  =   mongoose.Types.ObjectId,
      consts    =   require('../consts'),
      User      =   require('../models/user');

//Add new user to 'users' collection
exports.registerNewUser = (req,res) => { 
  var name = req.body.userName,
      pass = req.body.password,
      imgurl = req.body.imgUrl;

  var newUser = new User({
          userName: name,
          password: pass,
          imgUrl: imgurl,
          statuses: []
      });
  console.log(`Add new user: name ${name}, pass ${pass}, imgurl ${imgurl}`)
  try{
      var ret = conn.collection('users').save(newUser);
      console.log(ret);
  } catch (e){
    console.log(e);
    res.send(genarateErrorJson("Exception occoured on the server"));
    return false;
  }

  res.send(true);
  return true;
}

//Get all user statuses
exports.getUserStatuses = (req,res) => { 
  var urlPart = url.parse(req.url, true);
  var query   = urlPart.query;

  var name = query.userName;
  console.log(`find user: ${name}`);

  conn.collection('users').find(
      {userName: name},{'_id': 0, 'userName': 0, 'password': 0, 'imgUrl': 0}
    ).toArray(function(err, users) {
           console.log(users);
           res.send(users);
           return;
       });
    return;
}

//Add new status to user
exports.addUserStatus = (req,res) => { 
  var name          = req.body.userName,
      statusContent = req.body.statusContent;
      currDate      = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

  console.log(`Add status for user: ${name}`);
  try{
    conn.collection('users').update(
      {userName: name}, {
      $push: { statuses: {  
        _id: new ObjectId(),     
        date: currDate,
        content: statusContent,
        tweets: 0,
        likes: 0,
        comments: [] } 
      }
    }
    );  
  } catch (e){
    console.log(e);
    res.send(genarateErrorJson("Exception occoured on the server"));
    return false;
  }
  res.send(true);
  return true;
}

//Increament status tweets counter
exports.IncTweetForStatus = (req,res) => { 
  
  var id = req.body.statusId;
  console.log(`Inc tweets for status: ${id}`);

  try{
    conn.collection('users').update(
      {"statuses._id": ObjectId(id)}, {
      $inc: { "statuses.$.tweets": 1}
    }
    );  
  } catch (e){
    console.log(e);
    res.send(genarateErrorJson("Exception occoured on the server"));
    return false;
  }
  res.send(true);
  return true;
}

//Get Top status object
exports.GetTopStatusObj = (req,res) => { 
  console.log(`Fetch top status object`);
  conn.collection('users').aggregate(
    [
     { $unwind: "$statuses" },
     { $sort: { "statuses.tweets": -1 } },
     { $limit: 10 } 
    ]
    ).toArray(function(err, statuses) {
            console.log(statuses[0].statuses);
            var topStatus = {};
            topStatus["userName"] = statuses[0].userName;
            topStatus["statusObj"] = statuses[0].statuses;
            return res.send(topStatus);
       });
    return;
}

//Get status by id
exports.GetStatusById = (req,res) => { 
  var urlPart = url.parse(req.url, true);
  var query   = urlPart.query;

  var statusId = query.statusId;
  console.log(`Fetch status ${statusId}`);

  conn.collection('users').find(
     {"statuses._id": ObjectId(statusId)}
    ).toArray(function(err, user) {
             console.log(user[0]);
             var found = false;
             for(var index in user[0].statuses){
                if(user[0].statuses[index]._id == statusId){
                  console.log(user[0].statuses[index]);
                  var status = {};
                  status["userName"] = user[0].userName;
                  status["imgUrl"] = user[0].imgUrl;
                  status["statusObj"] = user[0].statuses[index];
                  return res.send(status);
                }
          }
          if(!found){
            return res.send(genarateErrorJson("Status not found"));
          }
       });
    return;
}

//Get top 10 statuses by tweets number
exports.GetTop10Statuses = (req,res) => { 
  console.log(`Fetch to 10 statuses`);

  conn.collection('users').aggregate(
    [
     { $unwind: "$statuses" },
     { $sort: { "statuses.tweets": -1 } },
     { $limit: 10 } 
    ]
    ).toArray(function(err, statuses) {
            var result = [];
            
            for(var statusIndex in statuses){
              var tempStatus = {};
              tempStatus["userName"] = statuses[statusIndex].userName;
              tempStatus["tweets"] = statuses[statusIndex].statuses.tweets;
              tempStatus["likes"] = statuses[statusIndex].statuses.likes;
              console.log(`tempStatus: ${tempStatus}`);

              result.push(tempStatus);
            }
            console.log(result);
            return res.send(result);
       });
    return;
}

//Get all posts in the system
exports.GetAllPosts = (req,res) => { 
  console.log(`Fetch all posts`);
  conn.collection('posts').find({}).toArray(function(err, posts) {
           console.log(posts);
           res.send(posts);
           return;
       });
  return;
}

//Get all posts summery in the system
exports.GetAllPostsSummery = (req,res) => { 
  console.log(`Fetch all posts summery`);
  conn.collection('posts').find({}).toArray(function(err, posts) {
            var result = [];
            for(var postIndex in posts){
              var splitedString = posts[postIndex].content.split(/[,.]+/, 5);
              var summeryObj = {};
              summeryObj['_id'] = posts[postIndex]._id;
              summeryObj['date'] = posts[postIndex].date;
              summeryObj['title'] = posts[postIndex].title;
              summeryObj['category'] = posts[postIndex].category;
              summeryObj['mainImgUrl'] = posts[postIndex].mainImgUrl;
              summeryObj['summery'] = splitedString;
              result.push(summeryObj);
            }
            console.log(result);
            return res.send(result);
       });
  return;
}

//Add new post
exports.addNewPost = (req,res) => { 
  
  var content   = req.body.postContent,
      title     = req.body.postTitle;
      category  = req.body.category;
      currDate  = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

  var newPost = new Post({
          title: title,
          date: currDate,
          category: category,
          mainImgUrl: "",
          contentImgsUrl: "",
          content: content,
          comments: []
      });

  console.log(`Add new post title ${title}, content ${content}`)

  try{
      var ret = conn.collection('posts').save(newPost);
      console.log(ret);
  } catch (e){
    console.log(e);
    res.send(genarateErrorJson("Exception occoured on the server"));
    return false;
  }

  res.send(true);
  return true;
}

//Get Post By Id
exports.GetPostById = (req,res) => { 
  var urlPart = url.parse(req.url, true);
  var query   = urlPart.query;

  var postId = query.postId;

  console.log(`Get Post by id ${postId}`);
  conn.collection('posts').find(
    {'_id': ObjectId(postId)}
    ).toArray(function(err, posts) {
           console.log(posts[0]);
           res.send(posts[0]);
           return;
       });
  return;
}

//Get posts summery by category
exports.GetPostsSummeryByCategory = (req,res) => { 
  var urlPart = url.parse(req.url, true);
  var query   = urlPart.query;

  var category = query.category;

  console.log(`Fetch all posts summery where category is ${category}`);

  conn.collection('posts').find(
    {'category': category}
  ).toArray(function(err, posts) {
            var result = [];
            for(var postIndex in posts){
              var splitedString = posts[postIndex].content.split(/[,.]+/, 5);
              var summeryObj = {};
              summeryObj['_id'] = posts[postIndex]._id;
              summeryObj['date'] = posts[postIndex].date;
              summeryObj['title'] = posts[postIndex].title;
              summeryObj['category'] = posts[postIndex].category;
              summeryObj['mainImgUrl'] = posts[postIndex].mainImgUrl;
              summeryObj['summery'] = splitedString;
              result.push(summeryObj);
            }
            console.log(result);
            return res.send(result);
       });
  return;
}

//Get posts by category
exports.GetPostsByCategory = (req,res) => { 
  var urlPart = url.parse(req.url, true);
  var query   = urlPart.query;

  var category = query.category;

  console.log(`Fetch all posts with category ${category} summery`);

  conn.collection('posts').find(
      {'category': category}
      ).toArray(function(err, posts) {
           console.log(posts);
           res.send(posts);
           return;
       });
  return;
}

//Get all posts categories
exports.GetPostsCategories = (req,res) => { 
  res.send(consts.CATEGORIES);
}


const genarateErrorJson = (msg) => {
    var errorJson = {};
    errorJson['Error'] = msg;
    return errorJson;
}