const mongoose  =   require('mongoose'),
      conn      =   require('../database'),
      url       = require('url'),
      Post      =   require('../models/post'),
      Status    =   require('../models/status'),
      ObjectId  = mongoose.Types.ObjectId,
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
  name = req.session.user.userName;
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
  
  var name          = req.session.user.userName,
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

  conn.collection('users').aggregate(
    [
     { $unwind: "$statuses" }
    ]
    ).toArray(function(err, statuses) {
             for(var index in statuses){
                if(statuses[index].statuses._id == statusId){
                  console.log(statuses[index]);
                  var status = {};
                  status["userName"] = statuses[index].userName;
                  status["statusObj"] = statuses[index].statuses;
                  return res.send(status);
                }
                else{
                  return res.send(genarateErrorJson("Status not found"));
                }
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
  conn.collection('posts').find({}, {'_id': 0}).toArray(function(err, posts) {
           console.log(posts);
           res.send(posts);
           return;
       });
  return;
}

//Get all posts in the system
exports.GetAllPostsSummery = (req,res) => { 
  console.log(`Fetch all posts summery`);
  conn.collection('posts').find({}, {'_id': 0}).toArray(function(err, posts) {
            var result = [];
            for(var postIndex in posts){
              var splitedString = posts[postIndex].content.split(/[,.]+/, 5);
              console.log(`splited: ${splitedString}`);
              result.push(splitedString);
            }
            console.log(result);
            return res.send(result);
       });
  return;
}

//Add new post
exports.addNewPost = (req,res) => { 
  
  var content = req.body.postContent,
      title   = req.body.postTitle;

  var newPost = new Post({
          title: title,
          date: new Date(),
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

const genarateErrorJson = (msg) => {
    var errorJson = {};
    errorJson['Error'] = msg;
    return errorJson;
}