let CustomerModel = require('../models/customer.model');
let PostModel = require('../models/post.model');
let MemeModel = require('../models/meme.model');
let jwtUtils = require('../utils/jwt.utils');
let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');


router.post('/newlike', (req, res ) => {
   

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    var memeId = req.body.memeId
    var postId = req.body.postId
  
    if ( memeId == null || postId == null || userId == null)
    {
        return res.status(400).json({ 'error': 'missing parameters' });
    }

    let model = new LikeModel({ 
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


router.get('/getAllUserLikes/:userId', (req, res ) => {
    
    if(!req.params.id)
     {
         return res.status(400).send('Wrong Id Number');
     }
     
    LikeModel.findAll({
       userId: req.params.id
    })
    .then(function(LikeFound) {
        res.json({LikeFound});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})



router.get('/getAllMemeLikes/:memeId', (req, res ) => {
    
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