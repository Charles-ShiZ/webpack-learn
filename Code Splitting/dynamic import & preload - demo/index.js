const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, "build")))
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/build/index.html'))
})

app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*")
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
	res.header("Access-Control-Allow-Headers", "X-Requested-With")
	res.header('Access-Control-Allow-Headers', 'Content-Type')
	next()
})
app.listen(3001)