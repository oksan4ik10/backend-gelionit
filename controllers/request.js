const errorHandler = require("../utils/errorHandler");

const Request = require("../models/Request");
const Product = require("../models/Product");

module.exports.getAll = async (req, res) => {
  try {
    let keysQuery = Object.assign({}, req.query);
    let paramOrdering = {};
    if (keysQuery["ordering"]) {
      const sort = keysQuery["ordering"][0] === "-" ? -1 : 1;
      const key =
        keysQuery["ordering"][0] === "-"
          ? keysQuery["ordering"].slice(1)
          : keysQuery["ordering"];
      paramOrdering[key] = sort;
    }
    delete keysQuery["ordering"];
    for (const key in keysQuery) {
      if (!keysQuery[key]) delete keysQuery[key];
    }

    const requests = await Request.find(keysQuery).sort(paramOrdering);
    res.status(200).json(requests);
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.create = async (req, res) => {
  const { name_user, email, phone, desc, IDproduct } = req.body;

  const request = new Request({
    name_user,
    email,
    phone,
    date: new Date(),
    desc: desc ? desc : "",
    IDproduct,
  });

  try {
    await request.save();
    res.status(200).json(request);
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.delete = async (req, res) => {
  try {
    await Request.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Удаление прошло успешно" });
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.update = async (req, res) => {
  const { name_user, email, phone, status, desc } = req.body;
  console.log(req.body);
  const request = await Request.findOne({ _id: req.params.id });
  if (name_user) request.name_user = name_user;
  if (email) request.email = email;
  if (phone) request.phone = phone;
  if (status) request.status = status;
  if (desc) request.desc = desc;

  try {
    await request.save();
    res.status(200).json(request);
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.getById = async (req, res) => {
  try {
    const request = await Request.findOne({ _id: req.params.id });
    if (!request) {
      res.status(404).json({
        message: "Заявка не найдена",
      });
    }

    res.status(200).json(request);
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.getUnprocessed = async (req, res) => {
  const requests = await Request.find({
    status: "new",
  });

  const dataPromise = await Promise.all(
    requests.map(async (item) => {
      const product = await Product.findOne({ _id: item.IDproduct });
      let obj = Object.assign({}, item);
      obj["product"] = product;
      return obj;
    })
  );

  const data = dataPromise.map((item) => ({
    ...item["_doc"],
    product: item["product"],
  }));
  res.status(200).json(data);
};
