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
    
    if(!req.params.id)
     {
         return res.status(400).send('Wrong Id Number');
     }
     
    CommentModel.find({
       memeId: req.params.id
    })
    .then(function(CommentFound) {
        res.json({CommentFound});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})

router.get('/getAllMemeComments', (req, res ) => {
    
    if(!req.body.memeId || !req.body.userId)
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