const mongoose = require('../src/db/mongoose.js')
const Task = require("../src/models/task.js")

Task.deleteOne({_id : "63c44adbbd2c6a3ec61b5241"}).then(() => {
    return Task.countDocuments({completed: true})
}).then((count) => {
    console.log(count)
}).catch((e) =>{
    console.log(e)
})

const deleteTaskAndCount = async (_id) => {
    const task = await Task.findByIdAndDelete(_id)
    const count = await Task.countDocuments()
    return count
}

deleteTaskAndCount("63c6de2ca8c2d540cb5680c5").then((count)=>{
    console.log(count)
}).catch((e) => {
    console.log(e)
})