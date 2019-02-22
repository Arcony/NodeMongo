let CustomerModel = require('../models/customer.model')
var jwtUtils = require('../utils/jwt.utils');
let express = require('express')
let router = express.Router()
var bcrypt = require('bcryptjs');


router.post('/login', (req, res ) => {
    var email    = req.body.email;
    var password = req.body.password;

    if (email == null ||  password == null) {
        return res.status(400).json({ 'error': 'Missing parameters' });
    }

    CustomerModel.findOne({
        email: req.body.email
    })
      .then( doc => {
        if(doc)
        {
        bcrypt.compare(password, doc.password, function(errBycrypt, resBycrypt) {
            if(resBycrypt) {
                return res.status(201).json({
                    'userId': doc.id,
                    'token': jwtUtils.generateTokenForUser(doc),
                    'username': doc.username,
                    'email': doc.email,
                    'isAdmin': doc.isAdmin
                });
              } else {
                return res.status(403).json({ 'error': 'Email or Password invalid' });
              }
        });
        } else {
            res.status(500).json({'error': 'Email or Password invalid'})
        }
      })
      .catch( err => {
        return res.status(500).json({ 'error': 'Email or Password invalid' });
      });
})


module.exports = router