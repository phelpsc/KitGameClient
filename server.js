const express = require("express"),
  path = require("path")

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile('/public/index.html',{root: __dirname})
})

app.listen(3000, () => {
    console.log('http://localhost:3000')
})
