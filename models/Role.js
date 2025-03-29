const { Schema, model } = require('mongoose')

const roleSchema = new Schema ({
    code: {
        type: String,
        required: true,
        unique:true
    },
    name: {
        type: String,
        required: true
    },

})

module.exports = model("roles", roleSchema)