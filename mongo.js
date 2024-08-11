const mongoose = require('mongoose')

console.log(process.argv)

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://tiaineno:${password}@db.1btou.mongodb.net/phoneBook?retryWrites=true&w=majority&appName=DB`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length===3){
  console.log('phonebook:')
  Person.find({}).then(result => {
    result.forEach(p => {
      console.log(p.name, p.number)
    })
    mongoose.connection.close()
  })
} else {
  const name = process.argv[3]
  const number = process.argv[4]
  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then(() => {
    console.log(`added ${name} number ${number} to the phonebook!`)
    mongoose.connection.close()
  })
}