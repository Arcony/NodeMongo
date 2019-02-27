let CustomerModel = require('../models/customer.model');
let PostModel = require('../models/post.model');
let MemeModel = require('../models/meme.model');
let CommentModel = require('../models/comment.model');
let jwtUtils = require('../utils/jwt.utils');
let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');


router.post('/newComment', (req, res ) => {
   

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    var memeId = req.body.memeId
    var postId = req.body.postId
    var text = req.body.text
  
    if ( memeId == null || postId == null || userId == null || text == null)
    {
        return res.status(400).json({ 'error': 'missing parameters' });
    }

    let model = new CommentModel({ 
        text: text,
        postId: postId, 
        memeId: memeId,
        userId: userId
    });

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




router.post('/newCommentComment', (req, res ) => {
   

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    var memeId = req.body.memeId
    var postId = req.body.postId
    var text = req.body.text
    var commentId = req.body.commentId
  
    if ( memeId == null || postId == null || userId == null || text == null || commentId == null)
    {
        return res.status(400).json({ 'error': 'missing parameters' });
    }

    let model = new CommentModel({ 
        text: text,
        postId: postId, 
        memeId: memeId,
        userId: userId,
        commentId: commentId
    });

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



router.get('/getAllUserComments/:userId', (req, res ) => {
    
    if(!req.params.id)
     {
         return res.status(400).send('Wrong Id Number');
     }
     
    CommentModel.find({
       userId: req.params.id
    })
    .then(function(CommentFound) {
        res.json({CommentFound});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})



router.get('/getAllMemeComments/:memeId', (req, res ) => {
    
    if(!req.params.memeId)
     {
         return res.status(400).send('Wrong Id Number');
     }
     
     var itemsProcessed = 0;
     var itemsProcessedBis = 0;
     var subProcess = 0;
     var subProcess2 = 0;
    CommentModel.find({
       memeId: req.params.memeId,
       commentId: null
    })
    .then(function(CommentsFound) {
        comments = JSON.parse(JSON.stringify(CommentsFound));
        CommentsFound.forEach((item, index, array) => {
            CommentModel.find({ commentId : item._id}).sort({'_id' : -1 })
            .then(function(SubCommentsFound) {
                comments[index].subComments = SubCommentsFound;
                comments[index].subCommentNb = SubCommentsFound.length;
                itemsProcessed++;
            if(itemsProcessed == array.length) {
                commentsUser = JSON.parse(JSON.stringify(comments));
                comments.forEach((item, index, array) => {
                CustomerModel.find({ _id : item.userId})
                .then(function(User) {
                    commentsUser[index].username = User[0].username;
                    commentsUser[index].userAvatar = User[0].picture;
                    itemsProcessedBis++;
                    if(itemsProcessedBis == array.length) {
                        CommentAndSubCommentUser = JSON.parse(JSON.stringify(commentsUser));
                        commentsUser.forEach((item, index3, array3) => {
                            if(commentsUser[index3].subComments.length > 0) {   
                                commentsUser[index3].subComments.forEach((item2, index2, array2) => {
                                    CustomerModel.find({ _id : commentsUser[index3].subComments[index2].userId})
                                    .then(function(subUser) {
                                        CommentAndSubCommentUser[index3].subComments[index2].username=subUser[0].username;  
                                        CommentAndSubCommentUser[index3].subComments[index2].userAvatar=subUser[0].picture; 
                                        subProcess2++;
                                        if(subProcess2 == array2.length) {
                                            subProcess++;
                                            if(subProcess == array3.length) {
                                                res.json(CommentAndSubCommentUser);
                                            }
                                            subProcess2 = 0;
                                        }    
                                    })
                                });
                            }
                            else {
                                subProcess++
                                if(subProcess == array3.length) {
                                    res.json(commentsUser);
                               }
                            }
                            
                        });
                    }
                })
                });
            }
            });
            
        });
    })
    .catch(err => {
        res.status(500).json(err)
    })
})

router.get('/getAllMemeComments', (req, res ) => {
    
    if(!req.body.memeId || !req.body.postId)
     {
         return res.status(400).send('Wrong params');
     }
     
    CommentModel.find({
       memeId: req.body.memeId,
       userId: req.body.userId
    })
    .then(function(CommentFound) {
        res.json({CommentFound});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


router.get('/getComment/:id', (req, res ) => {
    
    if( req.params.id )
     {
         return res.status(400).send('Wrong params');
     }
     
    CommentModel.findOne({
       _id: req.params.id
    })
    .then(function(CommentFound) {
        res.json({CommentFound});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


router.delete('/meme/delete/:id', (req, res ) => {
    

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId == null ) {
        return res.status(400).json({ 'error': 'User not logged' });
    }

    CustomerModel.findOne({
        _id: userId
    })
    .then(function(userFound) {
        if(!userFound.isAdmin)
        {
            MemeModel.findOneAndRemove({
                _id : req.params.id
            })
            .then(doc => {
                return res.status(400).json({ 'success': 'Meme Deleted' });
            })
            .catch(err => {
                res.status(500).json(err)
            })
        } else {
            return res.status(400).json({ 'error': 'Your power do not work here' });
        }
    })
    .catch(err => {
        res.status(500).json(err)
    })
   
    });


module.exports = router