var express = require('express');
var bodyParser = require('body-parser');
var userPath = require('./routes/controllers');
var serverConfig = require('./serverConfig');

var app = express();
var port = serverConfig.port();
var ip = serverConfig.ipAddr();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

var router = express.Router();

router.get('/', function(req, res) {
	res.json({ message: 'welcome to our upload module apis' });
});

router.post('/register', userPath.register);
router.post('/login', userPath.login);
router.get('/allUsers', userPath.getAllUsers);
router.get('/posts', userPath.getArticles);
router.post('/posts', userPath.postArticle);
router.post('/comments', userPath.postComment);
router.get('/comments', userPath.getComments);
router.get('/userPosts', userPath.getUserArticles);
router.get('/usernamePost', userPath.getPostUserName);
router.post('/comment', userPath.postComment);
router.get('/comment', userPath.getComments);
router.get('/UserComment', userPath.getCommentUserName);
router.get('/AllComments', userPath.getAllComments);
router.post('/likes', userPath.postLikes);
router.get('/likes',userPath.getLikes);
router.get('/allLikes', userPath.getAllLikes);
app.use('/api', router);
app.listen(port, ip);
console.log("IP=> "+ip+":"+port)