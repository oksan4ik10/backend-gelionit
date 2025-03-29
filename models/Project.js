const { Schema, model } = require('mongoose')

const projectSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    date_start: {
        type: Date,
        required: true
    },
    date_end: {
        type: Date,
        required: true
    },
    timePlan: {
        type: Number,
        required: true
    },
    idResponsibleUser: {
        ref:'workers',
        type: Schema.Types.ObjectId,
        required: true       
    },
    desc: {
        type: String,
    },
})

module.exports = model("projects", projectSchema)