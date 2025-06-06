const errorHandler = require("../utils/errorHandler");

const Product = require("../models/Product");

module.exports.getAll = async (req, res) => {
  try {
    const paramOrdering = { name: 1 };
    let options = {};
    if (req.query.search) {
      const re = new RegExp(".*" + req.query.search + ".*", "i");
      options = { name: re };
    }
    const products = await Product.find(options).sort(paramOrdering);
    res.status(200).json(products);
  } catch (e) {
    errorHandler(res, e);
  }
};
// module.exports.create = async (req, res) => {
//   const { name, timePlan, idResponsibleUser, date_start, date_end, desc } =
//     req.body;

//   const project = new Project({
//     name: name,
//     timePlan: timePlan,
//     idResponsibleUser: idResponsibleUser,
//     date_start: date_start,
//     date_end: date_end,
//     desc: desc ? desc : "",
//   });

//   try {
//     await project.save();
//     res.status(200).json(project);
//   } catch (e) {
//     errorHandler(res, e);
//   }
// };
module.exports.delete = async (req, res) => {
  try {
    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Удаление прошло успешно" });
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.update = async (req, res) => {
  const { name, count, desc } = req.body;
  console.log(req.body);
  const product = await Product.findOne({ _id: req.params.id });
  if (name) product.name = name;
  if (count) product.count = count;
  if (desc) product.desc = desc;

  try {
    await product.save();
    res.status(200).json(product);
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.getById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
      res.status(404).json({
        message: "Продукт не найден",
      });
    }
    res.status(200).json(product);
  } catch (e) {
    errorHandler(res, e);
  }
};
