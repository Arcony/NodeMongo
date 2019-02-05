let express = require('express')
let app = express()
let personRoute = require('./routes/person')
let customerRoute = require('./routes/customer')
let path = require('path')
let bodyParser = require('body-parser')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
  }));

app.use((req, res, next )=> {
    console.log(`${new Date().toString()} => ${req.originalUrl} ${req.body.email} `, req.body);
    next()
})
app.use(personRoute)
app.use(customerRoute)
app.use(express.static('public'))
app.use((err, req,res, next) => {
    res.sendFile(path.join(__direname, '500.html'))
})

app.get('/', (req, res) => {
    res.send('Hello World');
});


app.listen(8080, () => console.log("Working"));

