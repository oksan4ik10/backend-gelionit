const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
  },
});

module.exports = model("products", productSchema);
