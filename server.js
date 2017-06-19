const express           = require('express'),
      url               = require('url'),
      mongoose          = require('mongoose'),
      User              = require('./models/user');
      app               = express(),
      bodyParser        = require('body-parser'),
      TweetsManager     = require('./controllers/TweetsController.js'),
      path              = require('path'),
      session           = require('client-sessions'),
      port              = process.env.PORT || 3000;

//const conn = mongoose.connection;//get default connection

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use('/assets', express.static(path.join(__dirname, 'public')));

//------------------------------------------------------------------------------
app.use(session({
  cookieName: 'session',
  secret: 'tweetsessionmanagment',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));

//app.set('port',port);
app.use(
  (req,res,next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
      "Access-Control-Allow-Methods",
      "GET, POST"
  );
    res.header(
      "Access-Control-Allow-Credentials", true
  );
  res.set("Content-Type", "application/json");
  next();
});

app.post('/login', function(req, res) {
  User.findOne({ userName: req.body.name }, function(err, user) {
    if (!user) {
      res.json({"error": "user name not exists"});
    } else {
      if (req.body.password === user.password) {
        req.session.user = user;
        res.send(true);
      } else {
        res.json({"error": "invalid password"});
      }
    }
  });
});

app.get('/logout', function(req, res) {
  req.session.reset();
  res.send(true);
});

//Middleware to check if the user logged in
app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    User.findOne({ userName: req.session.user.userName }, function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user;  //refresh the session value
        res.locals.user = user;
      }
      next();
    });
  } else {
    next();
  }
});

//------------------------------------------------------------------------------

app.get('/', (req,res) => {
    console.log(`Get show api ${path.join(__dirname + '/api.html')}`);
    res.set("Content-Type", "text/html");
    res.sendFile(path.join(__dirname + '/public/api.html'));
});

app.post('/register', (req,res) => {
    return TweetsManager.registerNewUser(req,res);
    
});

app.get('/getUserStatuses',requireLogin, (req,res) => {
    return TweetsManager.getUserStatuses(req,res);
    
});

app.post('/addUserStatus',requireLogin, (req,res) => {
    return TweetsManager.addUserStatus(req,res);
});

app.post('/IncTweetForStatus', (req,res) => {
    return TweetsManager.IncTweetForStatus(req,res);
});

app.get('/GetTop10Statuses', (req,res) => {
    return TweetsManager.GetTop10Statuses(req,res);
});

app.get('/GetTopStatusObj', (req,res) => {
    return TweetsManager.GetTopStatusObj(req,res);
});

app.get('/GetStatusById', (req,res) => {
    return TweetsManager.GetStatusById(req,res);
});

app.get('/GetAllPosts', (req,res) => {
    return TweetsManager.GetAllPosts(req,res);
});

app.get('/GetAllPostsSummery', (req,res) => {
    return TweetsManager.GetAllPostsSummery(req,res);
});

app.post('/addNewPost', (req,res) => {
    return TweetsManager.addNewPost(req,res);
});

app.all('*', (req,res) => {
    res.status(404).json({
        Error: 'http verd is wrong, pls check the route and try again'
    });

});

//Function to invoke before methods that requiers login
function requireLogin (req, res, next) {
  if (!req.user) {
    res.json({"error": "you are not logged in, login and try again"});
  } else {
    next();
  }
};

app.listen(port);

console.log('listening');