const express = require("express")
const User = require("../models/user.js")
const auth = require("../middleware/auth.js")
const router = new express.Router()
const multer = require('multer')
const sharp = require("sharp")


const upload = multer({
    limits : {
        fileSize: 1 * 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error("Please upload image"))
        }
        cb(undefined, true) 
    }
})

router.post("/users", async (req, res) =>{
    const { name, email, password } = req.body
    const user = new User({name, email, password})

    try{
        const token = await user.generateAuthToken()
        user.save()
        res.status(201).send({user, token})
    }
    catch(e){
        res.status(400).send(e)
    }

   
})

router.post("/users/login", async(req,res)=> {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password) //return user
        const token = await user.generateAuthToken() 
        res.send({user, token})
    }
    catch(e){
        res.status(400).send(e.message)
    }
})

router.post("/users/logout", auth, async(req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => token.token != req.token)
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post("/users/logoutAll", auth, async (req, res) => {
    
    try{
        req.user.tokens = []

        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }

})

router.get("/users/me", auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name", "age", "password", "email"]

    const isValidOperation =  updates.every((update) => allowedUpdates.includes(update))       //returns false if one is false 

    if(!isValidOperation){
        return res.status(400).send({error: "invalid operation"})
    }

    try{
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.get("/users/:id/avatar", async (req,res) => {

    try{
        const user = await User.findById({_id: req.params.id})
        if(!user || !user.avatar){
            throw new Error("No avatar")
        }

        res.set("Content-Type", "image/png")
        res.send(user.avatar)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

router.post("/users/me/avatar", auth, upload.single('avatar'), async (req,res) => {
    //req.file.buffer is the file uploaded
    const buffer = await sharp(req.file.buffer).png().toBuffer()
    req.user.avatar = buffer 
    
    await req.user.save()
    res.send()
}, (error, req, res, next) => { //the arguments must be exactly like this to let express know you're handle the middleware errors
    res.status(400).send({error: error.message})
})

router.delete("/users/me/avatar", auth, async (req,res)=>{
    req.user.avatar = undefined
    try{
        await req.user.save()
        res.send()
    }catch(e){
        res.status(400).send({error:e})
    }
})

router.delete("/users/me", auth, async(req,res) => {

    try{
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})



module.exports = router