let CustomerModel = require('../models/customer.model')
let express = require('express')
let router = express.Router()
var bcrypt = require('bcryptjs');


const EMAIL_REGEX     = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX  = /^(?=.*\d).{4,8}$/;


router.post('/customer', (req, res ) => {
    

    var email    = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var picture      = req.body.picture;
    var isAdmin = req.body.isAdmin;

    if (email == null || username == null || password == null) {
      return res.status(400).json({ 'error': 'missing parameters' });
    }

    if (username.length >= 13 || username.length <= 4) {
      return res.status(400).json({ 'error': 'wrong username (must be length 5 - 12)' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ 'error': 'email is not valid' });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ 'error': 'password invalid (must length 4 - 8 and include 1 number at least)' });
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

router.get('/customer', (req, res ) => {
    if(!req.body.email)
     {
         return res.status(400).send('Missing Email');
     }
    CustomerModel.findOne({
        email: req.body.email
    })
    .then(doc => {
        res.json({email: res.body.email, username: res.body.username, picture: res.body.picture});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


router.put('/customer', (req, res ) => {

    var headerAuth  = req.headers['authorization'];
    var email       = jwtUtils.getUserId(headerAuth);

    if (email == null ||  password == null) {
        return res.status(400).json({ 'error': 'missing parameters' });
    }

    CustomerModel.findOne({
        email: email
    })
    .then(doc => {
        var userFound = doc;
    })
    .catch(err => {
        res.status(500).json(err)
    })

    bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
        CustomerModel.findOneAndUpdate({
            email: req.body.email
        }, {$set:req.body}, {
            new: true, upsert: true
        })
        .then(doc => {
            res.json(doc)
        })
        .catch(err => {
            res.status(500).json(err)
        })
    });
})


router.delete('/customer', (req, res ) => {
    

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserEmail(headerAuth);

    if (userId == null ) {
        return res.status(400).json({ 'error': 'User not logged' });
    }

    CustomerModel.findOne({
        id: userId
    })
    .then(doc => {
        var userFound = doc;
    })
    .catch(err => {
        res.status(500).json(err)
    })
    if(userFound.isAdmin)
    {
        CustomerModel.findOneAndRemove({
            email: req.body.email
        })
        .then(doc => {
            res.json(doc)
        })
        .catch(err => {
            res.status(500).json(err)
        })
    }
    });


module.exports = router