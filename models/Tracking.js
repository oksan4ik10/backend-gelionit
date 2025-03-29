const { Schema, model } = require('mongoose')

const trackingSchema = new Schema ({
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
    IDtask: {
        ref:'tasks',
        type: Schema.Types.ObjectId,
        required: true       
    },
    attr: [{
        dateWork: {type: Date,required: true},
        timePlan: {type: Number, required: true, default: 0},
        timeFact: {type: Number, default: 0},
    }]
})

module.exports = model("trackings", trackingSchema)