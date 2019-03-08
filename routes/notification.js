let CustomerModel = require('../models/customer.model');
let PostModel = require('../models/post.model');
let MemeModel = require('../models/meme.model');
let LikeModel = require('../models/like.model');
let jwtUtils = require('../utils/jwt.utils');
let NotificationModel = require('../models/notification.model');

let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');


router.post('/createNotificationComment', (req, res ) => {

    var headerAuth  = req.headers['authorization'];
    var userIdActing = jwtUtils.getUserId(headerAuth);

    var userTarget = req.body.userId
    var postId = req.body.postId
    var commentId = req.body.commentId
    var memeId = req.body.memeId
    console.log(commentId)
    
    if(userTarget == userIdActing) {
        return res.status(400).json({ 'error': 'Cant notify yourself' });
    }
    if ( postId == null || userTarget == null)
    {
        console.log("error")
        return res.status(400).json({ 'error': 'missing parameters' });
    }
    
    NotificationModel.find({
        memeId : memeId, type : "comment"
     })
     .then(function(NotificationForThisMeme) { 
         console.log("NotificationForThisMeme",NotificationForThisMeme)
        if(!NotificationForThisMeme.length > 0) {      
            console.log("NEW NOTIF TO 1 NB")
        
            let model = new NotificationModel({ 
                postId: postId, 
                userId: userTarget,
                memeId: memeId,
                commentId: commentId,
                seen: false,
                clicked : false,
                text: " Men of culture commented on your meme !",
                relatable : 1,
                itemTargeted : memeId,
                type: "comment",
            });
            model.save()
            .then(doc => {
                if(!doc || doc.length === 0)  {
                    console.log(doc);
                    return res.status(500).send(doc)
                    
                }
                console.log(doc);
                res.status(201).send(doc)
            })
            .catch(err => {
                res.status(500).json(err)
            })   
        }
        else {
            console.log("UPDATED TO +1")
            NotificationModel.findOneAndUpdate({
                _id: NotificationForThisMeme[0]._id
            },{$set : {seen : false, clicked : false, relatable : NotificationForThisMeme[0].relatable+1}})
            .then(function(){
                NotificationModel.findOne({
                    _id: notificationId
                }).then(function(NotifUpdated) {
                    res.send(NotifUpdated)
                })
                .catch(function(){
                    return res.status(400).send('Wrong new Notifcation');
                })
            })
            .catch(function(){
                console.log("allo");
                return res.status(400).send('Wrong Notifcation');
            }) 
        }
     });

})



router.post('/createNotificationLike', (req, res ) => {

    var headerAuth  = req.headers['authorization'];
    var userIdActing = jwtUtils.getUserId(headerAuth);

    var userTarget = req.body.userId
    var postId = req.body.postId
    var commentId = req.body.commentId
    var memeId = req.body.memeId
   
  
    if ( postId == null || userTarget == null)
    {
        console.log("error")
        return res.status(400).json({ 'error': 'missing parameters' });
    }

  
    console.log(memeId)
    NotificationModel.find({
        memeId : memeId, type : "like"
     })
     .then(function(NotificationForThisMeme) { 
        if(!NotificationForThisMeme.length > 0) {      
            console.log("NEW NOTIF TO 1 NB")
        
            let model = new NotificationModel({ 
                postId: postId, 
                userId: userTarget,
                memeId: memeId,
                commentId: commentId,
                seen: false,
                clicked : false,
                text: " Men of culture liked your meme !",
                relatable : 1,
                itemTargeted : memeId,
                type: "like",
                userList : [ userIdActing ],
            });
            model.save()
            .then(doc => {
                if(!doc || doc.length === 0)  {
                    console.log(doc);
                    return res.status(500).send(doc)
                    
                }
                console.log(doc);
                res.status(201).send(doc)
            })
            .catch(err => {
                res.status(500).json(err)
            })   
        }
        else {
            console.log(NotificationForThisMeme[0])
            if(NotificationForThisMeme[0].userList.filter(user => (user === userIdActing)))
            {

                console.log("User already liked once")
                res.status(500).json("User already liked once")
            }
            else {
            console.log("UPDATED TO +1")
            NotificationModel.findOneAndUpdate({
                _id: NotificationForThisMeme[0]._id
            },{ $push: {userList: userIdActing } ,$set : {seen : false, clicked: false, relatable : NotificationForThisMeme[0].relatable+1 }})
            .then(function(){
                console.log("ERROR ?")

                NotificationModel.findOne({
                    _id: notificationId
                }).then(function(NotifUpdated) {
                    res.send(NotifUpdated)
                })
                .catch(function(){
                    return res.status(400).send('Wrong new Notifcation');
                })
            })
            .catch(function(){
                return res.status(400).send('Wrong Notifcation');
            }) 
        }
        }
     });

})




router.post('/unlikeNotificationUpdate', (req, res ) => {

    var headerAuth  = req.headers['authorization'];
    var userIdActing = jwtUtils.getUserId(headerAuth);

    console.log("test");
    var postId = req.body.postId
    var commentId = req.body.commentId
    var memeId = req.body.memeId
    console.log("data ok ?")
    if ( postId == null )
    {
        console.log("error")
        return res.status(400).json({ 'error': 'missing parameters' });
    }
  
    console.log(memeId)
    NotificationModel.find({
        memeId : memeId, type : "like"
     })
     .then(function(NotificationForThisMeme) { 
         console.log(NotificationForThisMeme.length)
        if(NotificationForThisMeme.length == 1) {      
            console.log("enter")
           NotificationModel.findOneAndDelete({
            _id: NotificationForThisMeme[0]._id
           })
            .then(doc => {
                if(!doc || doc.length === 0)  {
                    return res.status(500).send(doc)
                }
                res.status(201).send(doc)
            })
            .catch(err => {
                res.status(500).json(err)
            })   
        }
        else {
            
            var userTarget = NotificationForThisMeme[0].userId;
            console.log(NotificationForThisMeme[0])
            if(NotificationForThisMeme[0].userList.filter(user => (user === userIdActing)))
            {
                NotificationModel.findOneAndUpdate({
                    _id: NotificationForThisMeme[0]._id
                },{ $pull: {userList: userIdActing } ,$set : {seen : false, clicked : false,  relatable : NotificationForThisMeme[0].relatable-1 }})
                .then(function(){
                    console.log("ERROR ?")
    
                    NotificationModel.findOne({
                        _id: notificationId
                    }).then(function(NotifUpdated) {
                        res.send(NotifUpdated)
                    })
                    .catch(function(){
                        return res.status(400).send('Wrong new Notifcation');
                    })
                })
                .catch(function(){
                    return res.status(400).send('Wrong Notifcation');
                }) 
            }
            
            
            
        
        }
     });

})


router.put('/clickNotification/:notificationId', (req, res ) => {

    var headerAuth  = req.headers['authorization'];
    var userIdActing      = jwtUtils.getUserId(headerAuth);
    notificationId = req.params.notificationId

    if ( notificationId == null )
    {
        return res.status(400).json({ 'error': 'missing parameters' });
    }


    NotificationModel.findOneAndUpdate({
        _id: notificationId
    },{$set : {clicked : true}})
    .then(function(){
        NotificationModel.findOne({
            _id: notificationId
        }).then(function(NotifUpdated) {
            res.send(NotifUpdated)
        })
        .catch(function(){
            return res.status(400).send('Wrong new Notifcation');
        })
    })
    .catch(function(){
        console.log("allo");
        return res.status(400).send('Wrong Notifcation');
    }) 
})



router.put('/seeNotification', (req, res ) => {

    var headerAuth  = req.headers['authorization'];
    var userIdActing      = jwtUtils.getUserId(headerAuth);

    if ( userIdActing == null )
    {
        return res.status(400).json({ 'error': 'missing parameters' });
    }

    NotificationModel.updateMany({
        userId: userIdActing
    },{$set : {seen : true}})
    .then(function(NotifUpdated){
        res.send(NotifUpdated)
    })
    .catch(function(){
        console.log("allo");
        return res.status(400).send('Wrong Notifcation');
    }) 
})




router.get('/getNotificationUser/:userId', (req, res ) => {

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    if(!req.params.userId)
     {
         return res.status(400).send('Wrong Id Number');
     }
     console.log("PARAMS LOOK OK ")
    var Counter = 0;
    NotificationModel.find({
       userId: userId
    }).sort({'_id' : -1}).limit(9)
    .then(function(NotificationsFound) {
        if(NotificationsFound.length == 0) {
            res.json([{'newNotifNb' : '0'}]);
        }
        else {
        newNotification = JSON.parse(JSON.stringify(NotificationsFound));
        Object.assign(newNotification[0] , {newNotifNb : 0})
        newNotification.forEach((item, index, array) => {
            if(!item.seen)
            {
                Counter++;
                newNotification[0].newNotifNb++;
                if(Counter == array.length) {
                console.log("////////// NEW NOTIF",newNotification)
                    res.json(newNotification);
                }
            }
            else {
                Counter++;
                if(Counter == array.length) {
                        res.json(newNotification);
                    }
            }
            
        });
    }
    })

    .catch(err => {
        res.status(500).json(err)
    })

})

module.exports = router