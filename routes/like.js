let CustomerModel = require('../models/customer.model');
let PostModel = require('../models/post.model');
let MemeModel = require('../models/meme.model');
let LikeModel = require('../models/like.model');
let jwtUtils = require('../utils/jwt.utils');
let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');


router.post('/newlike', (req, res ) => {
   

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    var memeId = req.body.memeId
    var postId = req.body.postId
    var commentId = req.body.commentId
  
    if ( memeId == null || postId == null || userId == null)
    {
        return res.status(400).json({ 'error': 'missing parameters' });
    }
    console.log("nosu a")
    let model = new LikeModel({ 
        postId: postId, 
        memeId: memeId,
        userId: userId,
        commentId: commentId
    });
    console.log("test")
    model.save()
    .then(doc => {
        if(!doc || doc.length === 0)  {
            return res.status(500).send(doc)
        }
        res.status(201).send(doc)
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


router.get('/getAllUserLikes/:userId', (req, res ) => {
    console.log("test");

    if(!req.params.userId)
     {
         return res.status(400).send('Wrong Id Number');
     }
    LikeModel.find({
       userId: req.params.userId
    })
    .then(function(LikeFound) {
        res.json({LikeFound});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})



router.get('/getAllMemeLikes/:memeId', (req, res ) => {
    
    if(!req.params.memeId)
     {
         return res.status(400).send('Wrong Id Number');
     }
     
    LikeModel.find({
       memeId: req.params.memeId
    })
    .then(function(LikesFound) {
        res.json({LikesFound});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


router.get('/getAllCommentLikes/:commentId', (req, res ) => {
    
    if(!req.params.id)
     {
         return res.status(400).send('Wrong Id Number');
     }
     
    LikeModel.findAll({
       memeId: req.params.id
    })
    .then(function(LikeFound) {
        res.json({LikeFound});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


router.get('/getLike', (req, res ) => {
    
    if(!req.body.memeId || !req.body.userId)
     {
         return res.status(400).send('Wrong params');
     }
     
    LikeModel.findOne({
       memeId: req.body.memeId,
       userId: req.body.userId
    })
    .then(function(LikeFound) {
        res.json({LikeFound});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


router.delete('/like/delete', (req, res ) => {
    

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    var memeId = req.body.memeId;
    var postId = req.body.postId;
    var commentId = req.body.commentId;


    if (userId == null || memeId == null || postId == null) {
        return res.status(400).json({ 'error': 'params wrong' });
    }

            LikeModel.findOneAndRemove({
                _id : req.params.id,
                memeId: memeId,
                postId: postId,
                commentId: commentId

            })
            .then(doc => {
                return res.status(400).json({ 'success': 'Like Deleted' });
            })
            .catch(err => {
                res.status(500).json(err)
            })
    })



module.exports = router