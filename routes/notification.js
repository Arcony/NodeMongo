let CustomerModel = require('../models/customer.model');
let PostModel = require('../models/post.model');
let MemeModel = require('../models/meme.model');
let LikeModel = require('../models/like.model');
let jwtUtils = require('../utils/jwt.utils');
let NotificationModel = require('../models/notification.model');

let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');


router.post('/createNotification', (req, res ) => {

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    var userTarget = req.body.userId
    var postId = req.body.postId
    var commentId = req.body.commentId
    console.log(commentId)
  
    if ( postId == null || userTarget == null)
    {
        console.log("error")
        return res.status(400).json({ 'error': 'missing parameters' });
    }
    console.log("new model")
    let model = new NotificationModel({ 
        postId: postId, 
        userId: userTarget,
        commentId: commentId,
        seen: false
    });
    console.log("to save")
    model.save()
    .then(doc => {
        if(!doc || doc.length === 0)  {
            console.log(doc);
            return res.status(500).send(doc)
            
        }
        res.status(201).send(doc)
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


module.exports = router