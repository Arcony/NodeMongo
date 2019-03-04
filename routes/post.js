let CustomerModel = require('../models/customer.model');
let PostModel = require('../models/post.model');
let MemeModel = require('../models/meme.model');
let _ = require('lodash')
let jwtUtils = require('../utils/jwt.utils');
let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const moment = require('moment')
const today = moment().startOf('day')

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

    if ( title == null )
    {
        return res.status(400).json({ 'error': 'missing parameters' });
    }
    
    let model = new PostModel({ 
        title: title, 
        content: relPath, 
        tag: req.body.tag,
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


router.get('/post/:id', (req, res ) => {
    
    if(!req.params.id)
     {
         return res.status(400).send('Wrong Post Number');
     }
     
    PostModel.findOne({
       _id: req.params.id
    })
    .then(function(PostFound) {
        res.json({id: PostFound.id, title: PostFound.title, content: PostFound.content, tag: PostFound.tag, userId: PostFound.userId});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})



router.get('/allPostMemes', (req, res ) => {
    
    var itemsProcessed = 0;
    PostModel.find({
    }).sort({'_id' : -1 })
    .then(function(PostFound) {
       var test = []
        PostFound.forEach((item, index, array) => {
                test = JSON.parse(JSON.stringify(PostFound));
                MemeModel.find({ postId: item._id})
                .then(function(MemesFind) {
              test[index].memesRelated = MemesFind.length;
                itemsProcessed++;
                if(itemsProcessed === array.length) {
                  callback(test,res);
                }
              });
        })

        
    })
    .catch(err => {
        res.status(500).json(err)
    })
})



router.get('/memesHot', (req, res ) => {
    
    var itemsProcessed = 0;
    PostModel.find({
    }).sort({ '_id' : -1 })
    .then(function(PostFound) {
        console.log(PostFound)
       var test = []
        PostFound.forEach((item, index, array) => {
                test = JSON.parse(JSON.stringify(PostFound));
                MemeModel.find({ postId: item._id})
                .then(function(MemesFind) {
              test[index].memesRelated = MemesFind.length;
                itemsProcessed++;
                if(itemsProcessed === array.length) {
                    sortedData = test.slice(0,10);
                    sortedData = _.sortBy( sortedData , [(data) => data.memesRelated]).reverse();
                    console.log(sortedData);
                    callback(sortedData,res);
                }
              });
        })

        
    })
    .catch(err => {
        res.status(500).json(err)
    })
})



router.get('/memesBest', (req, res ) => {
    
    var itemsProcessed = 0;
    PostModel.find({
    }).sort({ '_id' : -1 })
    .then(function(PostFound) {
        console.log(PostFound)
       var test = []
        PostFound.forEach((item, index, array) => {
                test = JSON.parse(JSON.stringify(PostFound));
                MemeModel.find({ postId: item._id})
                .then(function(MemesFind) {
              test[index].memesRelated = MemesFind.length;
                itemsProcessed++;
                if(itemsProcessed === array.length) {
                    sortedData = _.sortBy( sortedData , [(data) => data.memesRelated]).reverse();
                    console.log(sortedData);
                    callback(sortedData,res);
                }
              });
        })

        
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


router.get('/allPostMemesForProfil/:id', (req, res ) => {
    
    var itemsProcessed = 0;
    PostModel.find({'userId' : req.params.id
    }).sort({'_id' : -1 })
    .then(function(PostFound) {
       var test = []
        PostFound.forEach((item, index, array) => {
                test = JSON.parse(JSON.stringify(PostFound));
                MemeModel.find({ postId: item._id})
                .then(function(MemesFind) {
              test[index].memesRelated = MemesFind.length;
                itemsProcessed++;
                if(itemsProcessed === array.length) {
                  callback(test,res);
                }
              });
        })

        
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


router.get('/allPost', (req, res ) => {
    PostModel.find({
    })
    .then(function(PostFound) {
      res.json(PostFound);  
    })
    .catch(err => {
        res.status(500).json(err)
    })
})

router.get('/countPostMemes/:postId' , (req,res) => {
    MemeModel.count({ postId: req.params.postId})
    .then(function(MemesFind) {
        res.json(MemesFind)
    })
    .catch(err =>{
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


    function callback (item,res) {res.json(item);};

module.exports = router