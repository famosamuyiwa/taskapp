const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid")
            }
        },
        trim: true,
        lowercase: true,
        unique: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error("Age must be a positive number")
            }
        }
    },
    password: {
        type: String,
        trim: true,
        validate(value){
            if(value.length <= 6){
                throw new Error("Password must contain at least 7 characters")
            }

            if(value.includes("password")){
                throw new Error("Password can not be 'password'")
            }
        }
    },
    avatar:{
        type: Buffer
    },
    tokens: [{
        token : {
        type: String,
        required: true
    }
}]
}, 
{
    timestamps: true
})

//note this is not being stored in the database, it is simply a virtual link
userSchema.virtual('tasks', {     //"tasks" here can be named anything but for easy identification of which the reference is coming from, i suggest you use the Collection's name
    ref:'Task',  //Collection with reference
    localField: '_id', // field in the referenced Collection that is being referenced. which is id in User
    foreignField: 'owner' // field  that contains referenced field where the reference is coming from. which is owner(id) in Task
})



//userSchema.statics is used on models e.g User
//userSchema.methods is used on instances of a model e.g user 
//userSchema.virtual is used for referencing
//userSchema.pre is used for running a function before the argument passed is executed
//userSchema.post is used for running a function after the argument passed is executed

userSchema.methods.generateAuthToken = async function(){
    const user = this //"this" refers to the instance from which the method is called
    
    const token = jwt.sign({_id : user._id.toString()}, process.env.JWT_SECRET) //converting id to string because it would be a mongodb identifier object

    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}


//Converting user to javascript object so we can delete unwanted data to be displayed without deleting from db
userSchema.methods.toJSON = function(){     //method name must match exactly toJSON so it can stringify our response automatically
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})

    if(!user){
        throw new Error("Unable to Login")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error("Unable to Login")
    }

    return user
}

//Hash plain text password before saving
userSchema.pre('save', async function(next){ //not using es6 arrow function cos they don't function well with binding
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    
    next() //tells middleware to continue
})

//Delete user tasks when user is deleted
userSchema.pre("remove", async function(next) {
    const user = this
    await Task.deleteMany({owner: user._id})

    next()
})


const User = mongoose.model('User', userSchema)


module.exports = User