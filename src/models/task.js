const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        required: false,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, //saying data type of owner must be of objectID
        required: true,
        ref: 'User'         //this tells mongodb that this field references data from another collection User, Collection name must be spelt exactly as it was spelt when added to its mongoose model 
    }

},
{
    timestamps: true          //adds "created at" and "updated at" timestamps
})

const Task = mongoose.model('Task', taskSchema)



module.exports = Task