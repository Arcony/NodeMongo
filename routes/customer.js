let CustomerModel = require('../models/customer.model')
let express = require('express')
let router = express.Router()

router.post('/customer', (req, res ) => {
    // req.body
    if(!req.body)  {
        return res.status(400).send('request body nope');
    }

    let user = {
        //name: 'firstname lastname',
        //email: 'email@gmail.com'
    }
    console.log(req.body.email);
    let model = new CustomerModel(req.body)
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

router.get('/customer', (req, res ) => {
    if(!req.body.email)
     {
         return res.status(400).send('Missing Email');
     }
    CustomerModel.findOne({
        email: req.body.email
    })
    .then(doc => {
        res.json(doc)
    })
    .catch(err => {
        res.status(500).json(err)
    })
})


router.put('/customer', (req, res ) => {
    if(!req.body.email)
     {
         return res.status(400).send('Missing Email');
     }
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
})


router.delete('/customer', (req, res ) => {
    if(!req.body.email)
     {
         return res.status(400).send('Missing Email');
     }
    CustomerModel.findOneAndRemove({
        email: req.body.email
    })
    .then(doc => {
        res.json(doc)
    })
    .catch(err => {
        res.status(500).json(err)
    })
})

module.exports = router