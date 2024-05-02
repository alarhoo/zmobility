const express = require('express')
const app = express()
const path = require('path')

const parentFolderPath = path.resolve(__dirname, '..')

// add middleware to serve static file
app.use(express.static(path.join(parentFolderPath, 'webapp')))

// start the server
app.listen(8080, () => {
  console.log('Serving file "../webapp/index.html". Open at "localhost:8080". Use Ctr+C to shutdown')
})
