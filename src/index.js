const app = require('./app.js')//load in express app
const port = process.env.PORT

app.listen(port, () => {
    console.log("Server is running on port", port)
})