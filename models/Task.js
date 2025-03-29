const { Schema, model } = require('mongoose')

const taskSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    date_start: {
        type: Date,
        required: true
    },
    date_PlanEnd: {
        type: Date,
        required: true
    },
    timePlan: {
        type: Number,
        required: true
    },
    timeFact: {
        type: Number,
    },
    IDworker: {
        ref:'workers',
        type: Schema.Types.ObjectId,
        required: true       
    },
    IDproject: {
        ref:'projects',
        type: Schema.Types.ObjectId,
        required: true       
    },
    status: {
        type: String,
        default: "active",
        required: true
    },
    desc: {
        type: String
    }
})

module.exports = model("tasks", taskSchema)