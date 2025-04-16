const bcrypt = require("bcryptjs");
const errorHandler = require("../utils/errorHandler");

const Worker = require("../models/Worker");
const Role = require("../models/Role");

module.exports.getAll = async (req, res) => {
  const paramOrdering = { name: 1 };
  let options = {};
  if (req.query.search) {
    const re = new RegExp(".*" + req.query.search + ".*", "i");
    options = { name: re };
  }

  const workers = await Worker.find(options).sort(paramOrdering);

  const dataPromise = await Promise.all(
    workers.map(async (item) => {
      const cat = await Role.findOne({ _id: item.idRole });
      let obj = Object.assign({}, item);
      obj["role"] = cat;
      return obj;
    })
  );

  const data = dataPromise
    .filter((item) => item)
    .map((item) => ({
      ...item["_doc"],
      role: item["role"],
    }));
  res.status(200).json(data);
};
module.exports.create = async (req, res) => {
  const { name, login, password, idRole } = req.body;

  const candidate = await Worker.findOne({ login: login });
  if (candidate) {
    res.status(409).json({
      message: "Такой пользователь уже существует",
    });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const worker = new Worker({
    login: login,
    password: bcrypt.hashSync(password, salt),
    name: name,
    idRole: idRole,
  });

  try {
    await worker.save();
    res.status(200).json(worker);
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.delete = async (req, res) => {
  const worker = await Worker.findOne({ _id: req.params.id });
  if (worker.busy) {
    res
      .status("404")
      .json({ message: "Пользователь задейстован в доставке заказа" });
    return;
  }
  try {
    await Worker.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Удаление прошло успешно" });
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.update = async (req, res) => {
  const { password } = req.body;

  const worker = await Worker.findOne({ _id: req.params.id });
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    worker.password = bcrypt.hashSync(password, salt);
  }

  try {
    await worker.save();
    res.status(200).json({ message: "success" });
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.getById = async (req, res) => {
  try {
    const user = await Worker.findOne({ _id: req.params.id });
    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
    }
    const role = await Role.findOne({ _id: user.idRole });
    res.status(200).json({ ...user["_doc"], role: role });
  } catch (e) {
    errorHandler(res, e);
  }
};

module.exports.getBusyFree = async (req, res) => {
  try {
    let workers = await Worker.find({
      idRole: "67f265fe52e6aaa0d936b784",
      busy: false,
    });
    if (!workers.length === 0) {
      res.status(404).json({ message: "Сотрудники не найдены" });
    }

    const dataPromise = await Promise.all(
      workers.map(async (item) => {
        const cat = await Role.findOne({ _id: item.idRole });
        let obj = Object.assign({}, item);
        obj["role"] = cat;
        return obj;
      })
    );

    const data = dataPromise.map((item) => {
      const obj = {
        ...item["_doc"],
        role: item["role"],
      };
      delete obj["login"];
      delete obj["password"];
      return obj;
    });
    res.status(200).json(data);
  } catch (e) {
    errorHandler(res, e);
  }
};
