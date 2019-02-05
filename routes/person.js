let express = require('express');
let router = express.Router()

router.get('/person', (req, res) => {
    
})

router.get('/person/:name', (req, res) => {

    if(req.query.name) {
        res.send("blabla");
    } else {
        res.send("nothing");
    }
})


module.exports = router