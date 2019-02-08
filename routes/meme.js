let CustomerModel = require('../models/customer.model');
let PostModel = require('../models/post.model');
let MemeModel = require('../models/meme.model');
let jwtUtils = require('../utils/jwt.utils');
let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');



const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      const uploadsDir = path.join(__dirname, '..', 'images', 'uploads', `${Date.now()}`)
      fs.mkdirSync(uploadsDir)
      cb(null, uploadsDir)
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname)
    }
  })

const upload = multer({ storage })


router.post('/newMeme', upload.single('content'), (req, res ) => {
   

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    const remove = path.join(__dirname, '..','images','uploads');
    const relPath = req.file.path.replace(remove, '');
    var title = req.body.title;
    var tag = req.body.tag;
    var userId = userId;
    var postId = req.body.postId
    var content = req.body.content;
  
    if ( title == null )
    {
        return res.status(400).json({ 'error': 'missing parameters' });
    }

    let model = new MemeModel({ 
        title: title, 
        tag: req.body.tag,
        userId: userId,
        postId: req.body.postId,
        content: relPath
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
        res.json({id: MemeFound.id, title: MemeFound.title, tag: MemeFound.tag, userId: MemeFound.owner, postId: MemeFound.postId});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})



router.get('/allMeme', (req, res ) => {
    
    MemeModel.find({
    }).populate('userId')
    .then(function(memesFound) {
        res.json(memesFound)
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