require("./db/mongoose.js")
const express = require("express")
const userRouter = require("./routers/user.js")
const taskRouter = require("./routers/task.js")

const app = express()
app.use(express.json())

app.use(userRouter)// lets express know there's a file acting as a router that contains all endpoints 
app.use(taskRouter)

module.exports = app  // allows express to be used in other files without having to set this up all over again