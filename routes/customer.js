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

const EMAIL_REGEX     = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX  = /^(?=.*\d).{4,8}$/;



router.post('/customer', (req, res ) => {
    

    var email    = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var picture      = '';
    var isAdmin = req.body.isAdmin;

    if (email == null || username == null || password == null) {
      return res.status(400).json({ 'error': 'Missing parameters' });
    }

    if (username.length >= 13 || username.length <= 4) {
      return res.status(400).json({ 'error': 'Wrong username (must be length 5 - 12)' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ 'error': 'Email is not valid' });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ 'error': 'Password invalid (must length 4 - 8 and include 1 number at least)' });
    }

    bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
        let model = new CustomerModel({ 
            email: req.body.email, 
            username: req.body.username, 
            password: bcryptedPassword,
            picture: req.body.picture,
            isAdmin: req.body.isAdmin
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
    });

   
})

router.get('/customer/:id', (req, res ) => {
    if(!req.params.id)
     {
         return res.status(400).send('Missing User');
     }
    CustomerModel.findOne({
        _id: req.params.id
    })
    .then(function(CustomerFound) {
        res.json({id: CustomerFound.id, email: CustomerFound.email, username: CustomerFound.username, picture: CustomerFound.picture, isAdmin: CustomerFound.isAdmin});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


router.get('/getMyself', (req, res ) => {
    
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    CustomerModel.findOne({
        _id: userId
    })
    .then(function(CustomerFound) {
        res.json({id: CustomerFound.id, email: CustomerFound.email, username: CustomerFound.username, picture: CustomerFound.picture, isAdmin: CustomerFound.isAdmin});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})

router.get('/allCustomer', (req, res ) => {

    CustomerModel.find()
    .then(function(CustomersFound) {
        res.send(CustomersFound);
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


router.put('/updateMyselfAll', upload.single('picture'), (req, res ) => {


    var headerAuth  = req.headers['authorization'];
    var userId   = jwtUtils.getUserId(headerAuth);
    const remove = path.join(__dirname, '..','images','uploads');
    const relPath = req.file.path.replace(remove, '');

    if( userId == null )
    {
        return res.status(400).send('Wrong ID');
    }
    if( req.body.newPassword && req.body.oldPassword && req.file.path) {
    CustomerModel.find({ _id: userId})
    .then(function(userFound){
        bcrypt.compare(req.body.oldPassword, userFound[0].password, function(errBycrypt, resBycrypt) {
            if(resBycrypt) {
                bcrypt.hash(req.body.newPassword, 5, function( err, bcryptedPassword ) {
                CustomerModel.findOneAndUpdate({
                    _id: userId
                },{$set : {picture : relPath, password : bcryptedPassword}},{new: true})
                .then(function(userUpdated){
                    console.log("updated",userUpdated);
                    res.json(userUpdated);
                })
                .catch(function(){
                    console.log("allo");
                    return res.status(400).send('Wrong User');
                }) 
            });
            }
            else {
                console.log("wrong")
                res.json({"error" : "Wrong password used"})
            }
        });
            //end

    })
    .catch(function(){
            return res.status(400).send('Wrong new User');
        })
    }
    

})




router.put('/updateMyselfPicture', upload.single('picture'), (req, res ) => {


    var headerAuth  = req.headers['authorization'];
    var userId   = jwtUtils.getUserId(headerAuth);
    const remove = path.join(__dirname, '..','images','uploads');
    const relPath = req.file.path.replace(remove, '');

    if( userId == null )
    {
        return res.status(400).send('Wrong ID');
    }
    if(req.file.path) {
    CustomerModel.find({ _id: userId})
    .then(function(userFound){
    CustomerModel.findOneAndUpdate({
        _id: userId
    },{$set : {picture : relPath}},{new: true})
    .then(function(userUpdated){
        console.log("updated",userUpdated);
        res.json(userUpdated);
    })
    .catch(function(){
        console.log("allo");
        return res.status(400).send('Wrong User');
    }) 
    })
    .catch(function(){
            return res.status(400).send('Wrong new User');
        })
    }
    

})

router.put('/updateMyselfPassword', (req, res ) => {
    var headerAuth  = req.headers['authorization'];
    var userId   = jwtUtils.getUserId(headerAuth);

    if( userId == null ) {
        return res.status(400).send('Wrong ID');
    }
    if( req.body.newPassword && req.body.oldPassword) {
    CustomerModel.find({ _id: userId})
    .then(function(userFound){
        bcrypt.compare(req.body.oldPassword, userFound[0].password, function(errBycrypt, resBycrypt) {
            if(resBycrypt) {
                bcrypt.hash(req.body.newPassword, 5, function( err, bcryptedPassword ) {
                CustomerModel.findOneAndUpdate({
                    _id: userId
                },{$set : { password : bcryptedPassword}},{new: true})
                .then(function(userUpdated){
                    console.log("updated",userUpdated);
                    res.json(userUpdated);
                })
                .catch(function(){
                    console.log("allo");
                    return res.status(400).send('Wrong User');
                }) 
            });
            }
            else {
                console.log("wrong")
                res.json({"error" : "Wrong password used"})
            }
        });
    })
    .catch(function(){
            return res.status(400).send('Wrong new User');
        })
    }
})

router.put('/customer/:id', (req, res ) => {

    var headerAuth  = req.headers['authorization'];
    var userId       = jwtUtils.getUserId(headerAuth);
    if( userId == null )
    {
        return res.status(400).send('Wrong ID');
    }
    CustomerModel.findOneAndUpdate({
        _id: userId
    },{$set : {picture : req.body.picture}})
    .then(function(){
        console.log(userId);
        CustomerModel.findOne({
            _id: userId
        }).then(function(newUser) {
            res.send(newUser)
        })
        .catch(function(){
            return res.status(400).send('Wrong new User');
        })
    })
    .catch(function(){
        console.log("allo");
        return res.status(400).send('Wrong User');
    }) 

})


router.delete('/customer/:id', (req, res ) => {
    

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
            CustomerModel.findOneAndRemove({
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