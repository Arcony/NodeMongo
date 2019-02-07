let CustomerModel = require('../models/customer.model');
let PostModel = require('../models/post.model');
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

router.post('/newpost', upload.single('content'),(req, res ) => {
 
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    const remove = path.join(__dirname, '..','images','uploads');
    const relPath = req.file.path.replace(remove, '');
    var title = req.body.title;
    var tag = req.body.tag;
    var owner = userId;

    

    if ( title == null )
    {
        return res.status(400).json({ 'error': 'missing parameters' });
    }
    let model = new PostModel({ 
        title: title, 
        content: relPath, 
        tag: req.body.tag,
        owner: userId
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


router.get('/post/:id', (req, res ) => {
    
    if(!req.params.id)
     {
         return res.status(400).send('Wrong Post Number');
     }
     
    PostModel.findOne({
       _id: req.params.id
    })
    .then(function(PostFound) {
        res.json({id: PostFound.id, title: PostFound.title, content: PostFound.content, tag: PostFound.tag, owner: PostFound.owner});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})



router.delete('/post/delete/:id', (req, res ) => {
    

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
            PostModel.findOneAndRemove({
                _id : req.params.id
            })
            .then(doc => {
                return res.status(400).json({ 'success': 'Deleted' });
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