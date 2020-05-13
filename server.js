const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track')

app.use(cors())

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Not found middleware
/*app.use((req, res, next) => {
  return next({
    status: 404,
    message: 'not found'
  })
})*/

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

var userSchema = new mongoose.Schema({
  name: String
})

var User = mongoose.model('User', userSchema)

var exerciseSchema = new mongoose.Schema({
  userId: String,
  description: String,
  duration: Number,
  date: Date
})

var Exercise = mongoose.model('Exercise', exerciseSchema)

app.post('/api/exercise/new-user', (req, res) => {
  if (req.body.username) {
    User.create({
      name: req.body.username
    }, (err, data) => {
      if (err) {
        res.json({
          "Error": err
        })
      } else {
        res.json(data)
      }
    })
  } else {
    res.json({
      "Error": "Invalid input"
    })
  }
})

app.get('/api/exercise/users', (req, res) => {
  User.find((err, data) => {
    if (err) {
      res.json({
        "Error": err
      })
    } else {
      res.json(data)
    }
  })
})

app.post('/api/exercise/add', (req, res) => {
  if (!req.body.date) {
    req.body.date = Date.now()
  }
  Exercise.create({
    userId: req.body.userId,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date
  }, (err, data) => {
    if (err) {
      res.json({
        "Error": err
      })
    }
    res.json(data)
  })
})

app.get("/api/exercise/log", (req, res) => {
  console.log(parseInt(req.query.from))
  Exercise.find({
    userId: req.query.userId
    }
  ).skip(parseInt(req.query.from)).limit(parseInt(req.query.to)).exec((err, data) => {
    if (err) {
      res.json({
        "Error": err
      })
    } else {
      res.json(data)
    }
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})