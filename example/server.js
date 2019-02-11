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

app.listen(7070, () => {
    // console.log('server is running...')
})