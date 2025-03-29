const bcrypt = require("bcryptjs");
const errorHandler = require("../utils/errorHandler");

const Worker = require("../models/Worker");
const Role = require("../models/Role");

module.exports.getAll = async (req, res) => {
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
  let findTitle = "";
  delete keysQuery["ordering"];
  if (keysQuery["title"]) {
    findTitle = keysQuery["title"];
    delete keysQuery["title"];
  }

  for (const key in keysQuery) {
    if (!keysQuery[key]) delete keysQuery[key];
  }

  const workers = await Worker.find(keysQuery).sort(paramOrdering);

  const dataPromise = await Promise.all(
    workers.map(async (item) => {
      if (
        findTitle &&
        !item.name.includes(findTitle) &&
        !item.login.includes(findTitle)
      ) {
        return null;
      }
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
  const { name, salary, login, password, idRole } = req.body;

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
    password: password,
    name: name,
    salary: salary ? salary : null,
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
    res.status("404").json({ message: "Пользователь задейстован в проекте" });
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
  const { name, salary, password, idRole, busy } = req.body;

  const worker = await Worker.findOne({ _id: req.params.id });

  if (name) worker.name = name;
  if (salary) worker.salary = salary;
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    worker.password = password;
  }
  if (idRole) worker.idRole = idRole;
  if (busy !== undefined) worker.busy = busy;
  try {
    await worker.save();
    res.status(200).json(worker);
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
    const workers = await Worker.find({
      idRole: "67ab2aa301aad79d986f8c36",
      busy: false,
    });
    if (!workers.length === 0) {
      res.status(404).json({ message: "Пользователи не найдены" });
    }

    const dataPromise = await Promise.all(
      workers.map(async (item) => {
        const cat = await Role.findOne({ _id: item.idRole });
        let obj = Object.assign({}, item);
        obj["role"] = cat;
        return obj;
      })
    );

    const data = dataPromise.map((item) => ({
      ...item["_doc"],
      role: item["role"],
    }));
    res.status(200).json(data);
  } catch (e) {
    errorHandler(res, e);
  }
};
