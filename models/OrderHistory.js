const { Schema, model } = require("mongoose");

const ordersHistorySchema = new Schema({
  IDorder: {
    ref: "orders",
    type: Schema.Types.ObjectId,
    required: true,
  },
  update_date: {
    type: Date,
    required: true,
  },
  update_user: {
    ref: "workers",
    type: Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

module.exports = model("ordersHistory", ordersHistorySchema);
