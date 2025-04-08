const errorHandler = require("../utils/errorHandler");

const Request = require("../models/Request");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Worker = require("../models/Worker");
const OrderHistory = require("../models/OrderHistory");
module.exports.create = async (req, res) => {
  const { address, IDproduct, count, IDworker, IDrequest, desc, IDmanager } =
    req.body;

  const product = await Product.findOne({ _id: IDproduct });
  const date = new Date();
  let date_PlanDelivery = new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000);
  let status = "waiting_for_stock";
  if (product.count >= count) {
    status = "in_progress";
    console.log(product.count);

    product.count = product.count - +count;
    date_PlanDelivery = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
    try {
      await product.save();
    } catch (e) {
      errorHandler(res, e);
    }
  }
  const worker = await Worker.findOne({ _id: IDworker });
  const requestOrder = await Request.findOne({ _id: IDrequest });
  requestOrder.status = "accept";
  worker.busy = true;
  const request = new Order({
    address,
    status,
    count,
    date,
    date_PlanDelivery,
    IDworker,
    IDrequest,
    date: new Date(),
    desc: desc ? desc : "",
    IDproduct,
  });

  try {
    await worker.save();
    await request.save();
    await requestOrder.save();
    const orderHistoryRequest = new OrderHistory({
      IDorder: request._id,
      update_date: date,
      update_user: IDmanager,
      status,
    });
    await orderHistoryRequest.save();
    res.status(200).json(request);
  } catch (e) {
    errorHandler(res, e);
  }
};
