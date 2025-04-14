const errorHandler = require("../utils/errorHandler");

const Request = require("../models/Request");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Worker = require("../models/Worker");
const OrderHistory = require("../models/OrderHistory");
module.exports.create = async (req, res) => {
  const {
    address,
    IDproduct,
    count,
    IDworker,
    IDrequest,
    desc,
    IDmanager,
    name_user,
    phone,
    email,
  } = req.body;

  const product = await Product.findOne({ _id: IDproduct });
  const date = new Date();
  let date_PlanDelivery = new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000);
  let status = "waiting_for_stock";
  if (product.count >= count) {
    status = "in_progress";
    product.count = product.count - +count;
    date_PlanDelivery = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
    try {
      await product.save();
    } catch (e) {
      errorHandler(res, e);
    }
  }
  const worker = await Worker.findOne({ _id: IDworker });
  let idNewRequest = "";
  if (IDrequest) {
    const requestOrder = await Request.findOne({ _id: IDrequest });
    requestOrder.status = "accept";
    try {
      await requestOrder.save();
    } catch (e) {
      errorHandler(res, e);
      return;
    }
  } else {
    const newRequest = new Request({
      name_user,
      phone,
      email,
      date: new Date(),
      IDproduct,
      status: "accept",
    });
    try {
      await newRequest.save();
      idNewRequest = newRequest._id;
    } catch (e) {
      errorHandler(res, e);
      return;
    }
  }

  worker.busy = true;
  const request = new Order({
    address,
    status,
    count,
    date,
    date_PlanDelivery,
    IDworker,
    IDrequest: IDrequest || idNewRequest,
    date: new Date(),
    desc: desc ? desc : "",
    IDproduct,
  });

  try {
    await worker.save();
    await request.save();

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
module.exports.getAll = async (req, res) => {
  try {
    const paramOrdering = { date: +req.query.order };
    let options = {};
    const status = req.query.status;
    if (status) {
      options = { status };
    }
    const orders = await Order.find(options).sort(paramOrdering);
    const dataPromise = await Promise.all(
      orders.map(async (item) => {
        const worker = await Worker.findOne({ _id: item.IDworker });
        const product = await Product.findOne({ _id: item.IDproduct });
        const request = await Request.findOne({ _id: item.IDrequest });
        let obj = Object.assign({}, item);
        obj["worker"] = worker;
        obj["product"] = product;
        obj["request"] = request;
        return obj;
      })
    );

    const data = dataPromise.map((item) => ({
      ...item["_doc"],
      worker: item["worker"],
      product: item["product"],
      request: item["request"],
    }));
    res.status(200).json(data);
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.update = async (req, res) => {
  const { desc, address, status, IDupdate_user } = req.body;
  console.log(req.body);
  const order = await Order.findOne({ _id: req.params.id });
  if (desc) order.desc = desc;
  if (address && order.address !== address) {
    order.address = address;
  }
  if (status && order.status !== status) {
    order.status = status;
    const orderHistoryRequest = new OrderHistory({
      IDorder: req.params.id,
      update_date: new Date(),
      update_user: IDupdate_user,
      status,
    });
    try {
      await orderHistoryRequest.save();
    } catch (e) {
      errorHandler(res, e);
      return;
    }
  }

  try {
    await order.save();
    res.status(200).json(order);
  } catch (e) {
    errorHandler(res, e);
  }
};
