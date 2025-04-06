const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  date_PlanDelivery: {
    type: Date,
    required: true,
  },
  date_FactDelivery: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: "new",
    required: true,
  },
  IDproduct: {
    ref: "products",
    type: Schema.Types.ObjectId,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
  IDworker: {
    ref: "workers",
    type: Schema.Types.ObjectId,
    required: true,
  },
  IDrequest: {
    ref: "requests",
    type: Schema.Types.ObjectId,
    required: true,
  },
  desc: {
    type: String,
  },
});

module.exports = model("orders", orderSchema);
