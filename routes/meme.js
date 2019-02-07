let CustomerModel = require('../models/customer.model');
let PostModel = require('../models/post.model');
let MemeModel = require('../models/meme.model');
let jwtUtils = require('../utils/jwt.utils');
let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');


router.post('/newmeme', (req, res ) => {
   

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    var title = req.body.title;
    var tag = req.body.tag;
    var creator = userId;
    var postId = req.body.postId
  
    if ( title == null )
    {
        return res.status(400).json({ 'error': 'missing parameters' });
    }

    let model = new MemeModel({ 
        title: title, 
        tag: req.body.tag,
        creator: userId,
        postId: req.body.postId
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


router.get('/meme/:id', (req, res ) => {
    
    if(!req.params.id)
     {
         return res.status(400).send('Wrong Meme Number');
     }
     
    MemeModel.findOne({
       _id: req.params.id
    })
    .then(function(MemeFound) {
        res.json({id: MemeFound.id, title: MemeFound.title, tag: MemeFound.tag, creator: MemeFound.owner, postId: MemeFound.postId});
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