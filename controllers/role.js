const errorHandler = require("../utils/errorHandler");
const Role = require("../models/Role");
module.exports.getAll = async (_, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (e) {
    errorHandler(res, e);
  }
};
