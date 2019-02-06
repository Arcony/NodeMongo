let CustomerModel = require('../models/customer.model');
let PostModel = require('../models/post.model');
let jwtUtils = require('../utils/jwt.utils');
let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');


router.post('/newpost', (req, res ) => {
   

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    var title = req.body.title;
    var content = req.body.content;
    var tag = req.body.tag;
    var owner = userId;
  
    if ( title == null || content == null )
    {
        return res.status(400).json({ 'error': 'missing parameters' });
    }

    let model = new PostModel({ 
        title: title, 
        content: content, 
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
       tag: "Test"
    })
    .then(doc => {
        res.json({id: res.body.id, title: res.body.title, content: res.body.content, tag: res.body.tag, owner: res.body.owner});
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


module.exports = router