const { Schema, model } = require("mongoose");

const requestSchema = new Schema({
  name_user: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: "new",
    required: true,
  },
  desc: {
    type: String,
  },
  IDproduct: {
    ref: "products",
    type: Schema.Types.ObjectId,
    required: true,
  },
});

module.exports = model("requests", requestSchema);
