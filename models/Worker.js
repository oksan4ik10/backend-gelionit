const { Schema, model } = require("mongoose");

const workerSchema = new Schema({
  login: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  idRole: {
    ref: "roles",
    type: Schema.Types.ObjectId,
    required: true,
  },
  busy: {
    type: Boolean,
    default: false,
  },
});

module.exports = model("workers", workerSchema);
