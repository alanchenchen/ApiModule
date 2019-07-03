const app = require('express')()

app.post('/sayHello', (req, res) => {
    const author = req.get('Author')
    const from = req.get('From')
    res.send(`Hello  ${author}， 来自${from}模块`)
})

app.post('/sayHi', (req, res) => {
    const author = req.get('Author')
    const from = req.get('From')
    res.send(`Hi  ${author}， 来自${from}模块`)
})

app.post('/sayYo', (req, res) => {
    const author = req.get('Author')
    const from = req.get('From')
    res.send(`Yo  ${author}， 来自${from}模块`)
})

app.get('/name/:name/age/:age', (req, res) => {
    const name = req.params.name
    const age = req.params.age
    const testHeader = req.get('test')
    res.send(`your name is ${name}, and you're ${age} years old, the test header is ${testHeader}`)
})

app.post('/person/:name/:age', (req, res) => {
    const name = req.params.name
    const age = req.params.age
    res.send(`your name is ${name}, and you are ${age} years old`)
})

app.listen(7070, () => {
    // console.log('server is running...')
})