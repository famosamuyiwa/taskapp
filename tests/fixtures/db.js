const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const User = require("../../src/models/user.js")
const Task = require("../../src/models/task.js")


const existingUserId = new mongoose.Types.ObjectId()  //giving existing user an ID
const existingUserId2 = new mongoose.Types.ObjectId()  //giving existing user an ID

const existingUser = {
    _id: existingUserId,
    name: "Muyiwa",
    email: "nenling19@gmail.com",
    password: "Kay80704080",
    tokens:[{
        token: jwt.sign({_id: existingUserId}, process.env.JWT_SECRET)
    }]
}

const existingUser2 = {
    _id: existingUserId2,
    name: "Muyiwa",
    email: "nenling20@gmail.com",
    password: "Kay80704080",
    tokens:[{
        token: jwt.sign({_id: existingUserId2}, process.env.JWT_SECRET)
    }]
}


const nonExistentUser = {
    name: 'Andrew',
    email: 'andrewmead@example.com',
    password: 'Kay80704080'
}

const task = {
    _id: new mongoose.Types.ObjectId(),
    description: "Onise Iyanu",
    completed: false,
    owner: existingUserId
}

const task2 = {
    _id: new mongoose.Types.ObjectId(),
    description: "Iyanu",
    completed: true,
    owner: existingUserId
}

const task3 = {
    _id: new mongoose.Types.ObjectId(),
    description: "Onise",
    completed: true,
    owner: existingUserId2
}


const setupDatabase = async () =>{
    await User.deleteMany() //delete all existing users at the start of each test
    await Task.deleteMany()
    await new User(existingUser).save() //could also get const user = await User(existingUser), then user.save(). Basically ensures that theres an existing user in db before the start of each test
    await new User(existingUser2).save()
    await new Task(task).save()
    await new Task(task2).save()
    await new Task(task3).save()
}

module.exports = {
    existingUserId,
    existingUser,
    existingUser2,
    nonExistentUser,
    task,
    task2,
    task3,
    setupDatabase
}