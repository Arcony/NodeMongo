let CustomerModel = require('../models/customer.model');
let PostModel = require('../models/post.model');
let LikeModel = require('../models/like.model');
let MemeModel = require('../models/meme.model');
let CommentModel = require('../models/comment.model');

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

router.post('/newMeme',  upload.single('content'),  (req, res ) => {
   

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    const remove = path.join(__dirname, '..','images','uploads');
    const relPath = req.file.path.replace(remove, '');
    var title = req.body.title;
    var tag = req.body.tag;
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



router.get('/allPostMemes/:id', (req, res ) => {
    
    var postId = req.params.id;
    MemeModel.find({
        postId: postId
    })
    .then(function(memesFound) {
        res.json(memesFound)
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


router.get('/allMemesLikesComments/:postId', (req, res ) => {
    console.log("wtf")
    console.log("request received with params : ", req.params);
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    var itemsProcessed = 0;
    var itemsProcessedBis = 0;
    var itemsProcessedBisBis = 0;
    var itemsProcessedBisBisBis = 0;
    var postId = req.params.postId;
    MemeModel.find({
        postId: postId
    }).sort({'_id' : -1 })
    .then(function(memesFound) {
        var like = []
        memesFound.forEach((item, index, array) => {
                like = JSON.parse(JSON.stringify(memesFound));
                LikeModel.find({ memeId: item._id})
                .then(function(likesFind) {
                    like[index].likes = likesFind.length;
                itemsProcessed++;
                if(itemsProcessed === array.length) {
                    like.forEach((item, index, array) => {
                        comments = JSON.parse(JSON.stringify(like));
                        CommentModel.find({ memeId: item._id})
                        .then(function(commentsFind) {

                            comments[index].comments = commentsFind.length;
                        itemsProcessedBis++;
                        if(itemsProcessedBis === array.length) {                     
                          comments.forEach((item, index, array) => {
                            finalData = JSON.parse(JSON.stringify(comments));
                            LikeModel.find({ memeId: item._id , userId: userId})
                            .then(function(isLiked) {
                                finalData[index].isLiked = false;
                                if(isLiked[0]) {
                                    finalData[index].isLiked = true;
                                }
                                itemsProcessedBisBis++;
                                if(itemsProcessedBisBis === array.length) {
                                finalDataBis = JSON.parse(JSON.stringify(finalData));
                                finalDataBis.forEach((item, index, array) => {
                                    CommentModel.find({ memeId: item._id})
                                    .then(function(commentsNb) {
                                        finalDataBis[index].commentsNb = commentsNb.length;        
                                        itemsProcessedBisBisBis++;
                                        if(itemsProcessedBisBisBis === array.length) {
                                        callback(finalDataBis,res);
                                        }
                                    });
                                });
                                }
                            });
                        });
                        }
                      });
                })

                }
              });
        })
    })
    .catch(err => {
        res.status(500).json(err)
    })
})







router.get('/allMemesLikesCommentsForProfil/:userId', (req, res ) => {

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    var itemsProcessed = 0;
    var itemsProcessedBis = 0;
    var itemsProcessedBisBis = 0;
    var itemsProcessedBisBisBis = 0;
    var userId = req.params.userId;
    MemeModel.find({
        userId: userId
    }).sort({'_id' : -1 })
    .then(function(memesFound) {
        var like = []
        memesFound.forEach((item, index, array) => {
                like = JSON.parse(JSON.stringify(memesFound));
                LikeModel.find({ memeId: item._id})
                .then(function(likesFind) {
                    like[index].likes = likesFind.length;
                itemsProcessed++;
                if(itemsProcessed === array.length) {
                    like.forEach((item, index, array) => {
                        comments = JSON.parse(JSON.stringify(like));
                        CommentModel.find({ memeId: item._id})
                        .then(function(commentsFind) {

                            comments[index].comments = commentsFind.length;
                        itemsProcessedBis++;
                        if(itemsProcessedBis === array.length) {                     
                          comments.forEach((item, index, array) => {
                            finalData = JSON.parse(JSON.stringify(comments));
                            LikeModel.find({ memeId: item._id , userId: userId})
                            .then(function(isLiked) {
                                finalData[index].isLiked = false;
                                if(isLiked[0]) {
                                    finalData[index].isLiked = true;
                                }
                                itemsProcessedBisBis++;
                                if(itemsProcessedBisBis === array.length) {
                                finalDataBis = JSON.parse(JSON.stringify(finalData));
                                finalDataBis.forEach((item, index, array) => {
                                    CommentModel.find({ memeId: item._id})
                                    .then(function(commentsNb) {
                                        finalDataBis[index].commentsNb = commentsNb.length;        
                                        itemsProcessedBisBisBis++;
                                        if(itemsProcessedBisBisBis === array.length) {
                                        callback(finalDataBis,res);
                                        }
                                    });
                                });
                                }
                            });
                        });
                        }
                      });
                })

                }
              });
        })
    })
    .catch(err => {
        res.status(500).json(err)
    })
})




router.get('/allMemesLikedForProfil/:userId', (req, res ) => {

    var headerAuth  = req.headers['authorization'];
    var userIdConnected      = jwtUtils.getUserId(headerAuth);

    var itemsProcessed = 0;
    var itemsProcessedBis = 0;
    var itemsProcessedBisBis = 0;
    var itemsProcessedBisBisBis = 0;
    var itemsEnd = 1;
    var userId = req.params.userId;
    const memesFound = [];
    console.log("work?")
    LikeModel.find({ userId: userId}).sort({'_id' : -1 }).then(function(likesFound)  {
        console.log("work?")
        likesFound.forEach((item,index,array) => {
            MemeModel.find({
                _id: item.memeId
            }).then(function(meme){
                memesFound.push(meme[0]);
                console.log("push",meme[0]);
                if(itemsEnd === array.length)
                {   
                    console.log("allo????");
                    memesFound.forEach((item, index, array) => {
                        console.log(memesFound);
                        like = JSON.parse(JSON.stringify(memesFound));
                        LikeModel.find({ memeId: item._id})
                        .then(function(likesFind) {
                            console.log("likes",likesFind)
                            like[index].likes = likesFind.length;
                        itemsProcessed++;
                        if(itemsProcessed === array.length) {
                            like.forEach((item, index, array) => {
                                comments = JSON.parse(JSON.stringify(like));
                                CommentModel.find({ memeId: item._id})
                                .then(function(commentsFind) {
                                    console.log("commentsFind",commentsFind)
                                    comments[index].comments = commentsFind.length;
                                itemsProcessedBis++;
                                if(itemsProcessedBis === array.length) {                     
                                  comments.forEach((item, index, array) => {
                                    finalData = JSON.parse(JSON.stringify(comments));
                                    LikeModel.find({ memeId: item._id , userId: userId})
                                    .then(function(isLiked) {
                                        finalData[index].isLiked = false;
                                        if(isLiked[0]) {
                                            finalData[index].isLiked = true;
                                        }
                                        itemsProcessedBisBis++;
                                        if(itemsProcessedBisBis === array.length) {
                                        finalDataBis = JSON.parse(JSON.stringify(finalData));
                                        finalDataBis.forEach((item, index, array) => {
                                            CommentModel.find({ memeId: item._id})
                                            .then(function(commentsNb) {
                                                console.log("commentsNb",commentsNb)
                                                finalDataBis[index].commentsNb = commentsNb.length;        
                                                itemsProcessedBisBisBis++;
                                                if(itemsProcessedBisBisBis === array.length) {
                                                    console.log("callbacCKKKKKKK")
                                                callback(finalDataBis,res);
                                                
                                                }
                                            });
                                        });
                                        }
                                    });
                                });
                                }
                              });
                        })
            
                        }
                      });
                })
                }
                console.log("item????");
                itemsEnd++;
            });
            
        })
       
    });


        
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

    function callback (item,res) { res.json(item); };



    
module.exports = router