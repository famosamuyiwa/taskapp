const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth.js")
const Task = require("../models/task.js")

//note: when a value is provided in query strings, the value is always going to be a string. Its your job to do the conversion
//GET /tasks?completed=true
//GET /tasks?limit=2&skip=2                examples of using the queries.
//GET /tasks?sortBy=createdAt:desc

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed){
       match.completed = req.query.completed === 'true' // this will return true or false. The 'true' from the params is of type string, hence the reason for this line of code
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")     //splitting by : because thats the special character we used to separate what we're sorting by and it's order (desc/asc)
        sort[parts[0]] = (parts[1] === "desc") ? -1 : 1         //-1 for descending, 1 for ascending. its ascending by default, this line assigns the result from the shorthand If syntax to determine if what we're sorting by is ascending or descending
    }

    try{
        await req.user.populate({
            path: "tasks",  //name used in creating virtual rel
            match,   //this is used to filter results
            options: {
                limit: parseInt(req.query.limit),   //max number of results to return
                skip: parseInt(req.query.skip),  //pagination skip the number of results supplied
                sort    //this is used to sortBy
            }
        })    //adds "tasks" object with results (if any) to req.user payload
        res.send(req.user.tasks)
    }catch(e){
        res.status(400).send(e)
    }
})

router.get("/task/:id", auth, async (req, res) => {
    
    try{
        const task = await Task.findOne({_id : req.params.id, owner:req.user._id}) 
        if(!task){
            return res.status(404).send({message:"Task not found"})
        }
        res.send(task)
    }catch(e){
        res.status(500).send()
    }

})


router.patch("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id 
    const updates = Object.keys(req.body)
    const allowedUpdates = ["description", "completed"]
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: "Invalid updates"})
    }

    try{
        const task = await Task.findOne({_id, owner: req.user._id})

        if(!task){
            return res.status(404).send({message:"Task not found"})
        }
        updates.forEach((update => task[update] = req.body[update]))
        await task.save()
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})


router.post('/tasks', auth, async (req, res) => {

    const task = Task({ 
        ...req.body,                //es6 syntax to help unpack req.body while being able to add more data after it
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id

    try{
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})
        if(!task){
            return res.status(404).send({message:"Task not found"})
        }
        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router