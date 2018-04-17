var mysql = require('mysql');
var Hashids = require('hashids');
var hashids = new Hashids();
var url = require('url');

var conn = mysql.createConnection({
	host	 	:'localhost',
	user 		:'root',
	password	:'root',
	database	:'article_user'
});

//connecting to mysql DB.
conn.connect(function(err){
	if(!err) {
		console.log("Database is connected........");
	} else {
		console.log("Error.. "+err);
	}
});

//method for user register
exports.register = function(req, res) {
	console.log("req",	req.body);
	var today = new Date();
	var users = {
		"first_name": req.body.first_name,
		"last_name": req.body.last_name,
		"email": req.body.email,
		"password": req.body.password,
		"created": today,
		"modified": today
	}
	conn.query('INSERT INTO users SET ?',users, function (error, results, fields) {
		if (error) {
			console.log("error occured", error.code);
			res.send({
				"code":400,
				"failed":"error occured"
			});
		} else {
			console.log("The solution is: ", results);
			res.send({
				"code":200,
				"success":"user registered successfully"
			});
		}
	});	
}

//method to fetch all users in DB.
exports.getAllUsers = function(req, res) {
	//console.log(req);
	conn.query('SELECT * FROM users', function(error, results, fields) {
		if(error) {
			console.log("Error: "+ error.code);
			return;
		}
		res.json(results);
	});
}

//method to fetch user details. 
exports.getUserDetails = function(req, res) {
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var uid;
	uid = qdata.id;
	console.log(req);
	conn.query("SELECT * FROM users WHERE id ="+uid, function(err,results, fields) {
		if(err) {
			console.log("Error: "+ error.code);
			return;
		}
		console.log(results);
		res.json(results);
	});
}

//method to perform login action.
exports.login = function(req, res){
	console.log(req.body);
	var email;
	var password;
	email = req.body.email;
	password = req.body.password;	 
	conn.query('SELECT * FROM users WHERE email = ?', [email], function(error, results, fields) {
		if (error) {
			console.log("error occured", error.code);
			res.send({
				"code":400,
				"failed":"error occured"
			});
		} else {
			console.log('The solution is: ', results);
			if(results.length > 0) {
				if(results[0].password == password){
					uid = results[0].id;
					console.log("User ID: "+uid);
					res.send({
						"code":200,
						"success":"login successfully",
						"uid":uid
					});
					
				} else {
					res.send({
						"code":204,
						"success":"Email and password does not match"
					});
				}
			} else {
				res.send({
					"code":204,
					"success":"Email does not exits"
				});
			}
		}
	});
}

//fetching all Articles in the DB.
exports.getArticles = function(req, res) {
	//console.log(req);
	conn.query('SELECT * FROM posts', function(err, results, fields) {
		if(err) {
			console.log("Error: "+ error.code);
			return;
		}
		console.log(results);
		res.json(results);
	});
}


//fetching all Articles posted by user, id = user's id.
exports.getUserArticles = function(req, res) {
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var uid;
	uid = qdata.id;
	console.log(req);
	conn.query("SELECT * FROM posts WHERE userid ="+uid, function(err,results, fields) {
		if(err) {
			console.log("Error: "+ error.code);
			return;
		}
		console.log(results);
		res.json(results);
	});
}

// post Articles in the DB, id = user's id.
exports.postArticle = function(req, res) {
	
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var uid;
	uid = qdata.id;

	console.log(req.body);
	console.log(uid);
	var today = new Date();
	var articles = {
		"content": req.body.content,
		"created": today,
		"modified": today,
		"userid": uid
	}
	
	conn.query('INSERT INTO posts SET?', articles, function(error, results, fields) {
		if(error) {
			console.log("Error Occured", error.code)
			res.send({
				"code":400,
				"failed":"Failed to upload the content"		
			});
		} else {
			console.log("Content: ", results);
			res.send({
				"code":200,
				"success":"Post Uploaded successfully",
				"post_id":results.insertId
			});
		}
	});

}

//post comments for the post, id passed both user id and post id, 
exports.postComment = function(req, res) {
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var uid;
	var pid;
	uid = qdata.uid;
	pid = qdata.pid;
	var today = new Date();

	var comments = {
		"comment": req.body.comment,
		"created": today,
		"modified": today,
		"postid": pid,
		"userid": uid
	}

	conn.query('INSERT INTO comments SET?', comments, function(error, results, fields) {
		if(error) {
			console.log("Error Occured", error.code)
			res.send({
				"code":400,
				"failed":"Failed to upload the content"		
			});
		} else {
			console.log("Content: ", results);
			res.send({
				"code":200,
				"success":"Post Uploaded successfully"
			});
		}
	});
}

//fetching comments for a particular post, id = post id. using join(comments, posts) for extracting comments for the post.
exports.getComments = function(req, res) {
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var pid;
	pid = qdata.pid;

	conn.query("SELECT comment FROM comments JOIN posts ON posts.id = comments.postid WHERE posts.id="+pid, function(err, results, fields) {
		if(err) {
			console.log("Error: "+ error.code);
			return;
		}
		res.json(results);
	});
}

//fetching username for the posts. id = post id, using join(users, posts) for extracting username.
exports.getPostUserName = function(req, res) {

	var q = url.parse(req.url, true);
	var qdata = q.query;
	var uid;
	pid = qdata.id;

	conn.query("SELECT first_name FROM users JOIN posts ON posts.userid=users.id WHERE posts.id ="+pid, function(err, results, fields) {
		if(err){
			console.log("Error: "+ error.code);
			return;
		}
		res.json(results)
	});
}

//get username from the user's comment. id = comment id, using join(users,comments) for extracting username.
exports.getCommentUserName = function(req, res) {
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var cid;
	cid = qdata.id;

	conn.query("SELECT first_name FROM users JOIN comments ON comments.userid = users.id WHERE comments.id="+cid, function(err, results, fields) {
		if(err) {
			console.log("Error: "+ error.code);
			return;
		}
		res.json(results);
	}); 
}

//get All comments in DB.
exports.getAllComments = function(req, res) {
	//console.log(req);
	conn.query('SELECT * FROM comments', function(err, results, fields) {
		if(err) {
			console.log("Error: "+ error.code);
			return;
		}
		console.log(results);
		res.json(results);
	});
}

//POST likes for articles in DB, uid= user's id and pid= post's id.
exports.postLikes = function(req, res){
	//console.log(req);
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var uid;
	var pid;
	uid = qdata.uid;
	pid = qdata.pid;
	var today = new Date();

	var likes = {
		"postid": pid,
		"userid": uid,
		"created": today,
		"modified": today
	}

	conn.query('INSERT INTO artlikes SET?', likes, function(error, results, fields) {
		if(error) {
			console.log("Error Occured", error.code);
			console.log("Error Type", typeof error.code);
			if(error.code == 'ER_DUP_ENTRY'){
				del_like(pid, uid, res);
			} else {
				res.send({
				"code":400,
				"failed":"Failed to upload the content"		
			});
			}
			
		} else {
			console.log("Content: ", results);
			res.send({
				"code":200,
				"success":"Like Uploaded successfully"
			});
		}
	});
}

del_like = function(pid, uid, res) {
	console.log("Del Called");
	conn.query("DELETE FROM artlikes WHERE postid="+pid+" AND userid="+uid, function(error, results, fields) {
		if (error) {
			console.log("Error: "+ error.code);
			return;
		} else {
			console.log(results.affectedRows);
			res.send({
				"code":200,
				"success":"Like Deleted successfully",
				"affectedRows": results.affectedRows
			});
		}
	});
}

//method to count number of likes for the post, pid = post's id.
exports.getLikes = function(req, res) {
	//console.log(req);
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var pid;
	pid = qdata.pid;
	conn.query("SELECT COUNT(postid) FROM artlikes WHERE postid="+pid, function(error, results, fields) {
		if(error) {
			console.log("Error: "+ error.code);
			return;
		}
		res.json(results);
	});
} 

//method to fetch all likes in DB.
exports.getAllLikes = function(req, res) {
	//console.log(req);
	conn.query('SELECT * FROM artlikes', function(error, results, fields) {
		if(error){
			console.log("Error: "+ error.code);
			return;
		}
		res.json(results);
	});
}

//method for Uploading User Profile pictures.
exports.postProfilePic = function(req, res) {
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var uid;
	uid = qdata.uid;
	console.log(req.files);
	if(!req.files)
		return res.send({
			"code":400,
			"status": "No files were uploaded"
		});
	var file = req.files.uploaded_image;
	var img_name = "user_"+uid;
	console.log(img_name);
	console.log(file.name);
	var result;
	if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {
		file.mv('public/images/user_profile_images/'+img_name, function(err) {
			if(err)
				return res.send({
					"code":500,
					"Error":err
				});

			conn.query("UPDATE users SET user_image='"+img_name+"' WHERE id="+uid, function(error, results, fields) {
				if(error) {
					console.log("Error: "+ error.code);
					return;
				}
				result = results;
			});
			res.send({
				"code":200,
				"Status":"File Uploaded successfully",
				"Result": result
			});	
		});
	} else {
		res.send({
			"code":500,
			"status":"This Format is not allowed"
		});
	} 
}

//method for fethcing profile pic name.
exports.getProfilePic = function(req, res) {
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var uid;
	uid = qdata.uid;
	conn.query("SELECT user_image FROM users WHERE id="+uid, function(error, results, fields) {
		if(error){
			console.log("Error: "+ error.code);
			return;
		}
		res.json(results);
	});
}

//method for uploading Article's Pictures.
exports.postArticlePic = function(req, res) {
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var pid;
	pid = qdata.pid;
	console.log(req.files);
	if(!req.files)
		return res.send({
			"code":400,
			"status": "No files were uploaded"
		});
	var file = req.files.uploaded_image;
	var img_name = "article_"+pid;
	console.log(img_name);
	console.log(file.name);
	var result;
	if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {
		file.mv('public/images/article_images/'+img_name, function(err) {
			if(err)
				return res.send({
					"code":500,
					"Error":err
				});

			conn.query("UPDATE posts SET article_image='"+img_name+"' WHERE id="+pid, function(error, results, fields) {
				if(error) {
					console.log("Error: "+ error.code);
					return;
				}
				result = results;
			});
			res.send({
				"code":200,
				"Status":"File Uploaded successfully",
				"Result": result
			});	
		});
	} else {
		res.send({
			"code":500,
			"status":"This Format is not allowed"
		});
	} 
}

//method for fetching Article Image name.
exports.getArticlePic = function(req, res) {
	var q = url.parse(req.url, true);
	var qdata = q.query;
	var pid;
	pid = qdata.pid;
	conn.query("SELECT article_image FROM posts WHERE id="+pid, function(error, results, fields) {
		if(error){
			console.log("Error: "+ error.code);
			return;
		}
		res.json(results);
	});
}

