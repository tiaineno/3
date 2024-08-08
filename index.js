const express = require('express')
const app = express()
require('dotenv').config()
const Person = require('./models/person')
const morgan = require('morgan')

app.use(express.static('dist'))
app.use(express.json())

morgan.token('post', (request) => {
  if (['POST', 'PUT'].includes(request.method)){
    return JSON.stringify(request.body)
  }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'))

const cors = require('cors')

app.use(cors())

app.get('/', (request, response) => {
  response.send('<h1>FRONT EI TOMI :(</h1>')
})

app.get('/info', (request, response) => {
  Person.countDocuments({}).then(p => {
    response.send(`<p>Phonebook has info for ${p} people</p>
      <p>${new Date()}</p>`)
  }).catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(p => {
    if (p) {
      response.json(p)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(p => {
    if (p) {
      response.json(p)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

  Person.findOne({ name: body.name })
    .then(existingPerson => {
      if (existingPerson) {
        return response.status(400).json({ 
          error: 'This person already exists' 
        })
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      })

      return person.save()
      .then(savedPerson => {
        response.json(savedPerson)
      })
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {

  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id, 
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  ) 
    .then(p => {
      response.json(p)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})