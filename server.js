let express = require('express')
let app = express()
let connectionRoute = require('./routes/connection')
let customerRoute = require('./routes/customer')
let postRoute = require('./routes/post')
let memeRoute = require('./routes/meme')
let likeRoute = require('./routes/like')
let path = require('path')
let bodyParser = require('body-parser')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
  }));

app.use((req, res, next )=> {
    console.log(`${new Date().toString()} => ${req.originalUrl}`, req.body);
    next()
})
app.use(postRoute)
app.use(customerRoute)
app.use(connectionRoute)
app.use(memeRoute)
app.use(likeRoute)
app.use(express.static('public'))
app.use((err, req,res, next) => {
})

app.get('/', (req, res) => {
    res.send('Hello World');
});


app.listen(8080, () => console.log("Working"));

