const errorHandler = require("../utils/errorHandler");

const Project = require("../models/Project");
const Task = require("../models/Task");
const Worker = require("../models/Worker");
const Tracking = require("../models/Tracking");

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
  delete keysQuery["ordering"];
  for (const key in keysQuery) {
    if (!keysQuery[key]) delete keysQuery[key];
  }
  const tasks = await Task.find(keysQuery).sort(paramOrdering);

  const dataPromise = await Promise.all(
    tasks.map(async (item) => {
      const worker = await Worker.findOne({ _id: item.IDworker });
      const project = await Project.findOne({ _id: item.IDproject });
      let obj = Object.assign({}, item);
      obj["worker"] = worker;
      obj["project"] = project;
      return obj;
    })
  );

  const data = dataPromise.map((item) => ({
    ...item["_doc"],
    worker: item["worker"],
    project: item["project"],
  }));
  res.status(200).json(data);
};
module.exports.getTaskUser = async (req, res) => {
  try {
    const task = await Task.findOne({
      IDworker: req.params.id,
      status: { $in: ["Новый", "В процессе"] },
    });
    if (!task) {
      res.status(404).json({ message: "Задача не найдена" });
      return;
    }
    const worker = await Worker.findOne({ _id: task.IDworker });
    const project = await Project.findOne({ _id: task.IDproject });
    res.status(200).json({ ...task["_doc"], worker: worker, project: project });
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.create = async (req, res) => {
  const {
    name,
    timePlan,
    date_start,
    date_PlanEnd,
    desc,
    IDworker,
    IDproject,
    status,
  } = req.body;

  const task = new Task({
    name: name,
    timePlan: timePlan,
    date_start: date_start,
    date_PlanEnd: date_PlanEnd,
    status: status,
    IDworker: IDworker,
    IDproject: IDproject,
    desc: desc ? desc : "",
  });

  const IDtask = task._id;
  const dateObj = getDatesInRange(
    new Date(date_start),
    new Date(date_PlanEnd)
  ).map((item) => ({
    dateWork: item,
    timePlan: 0,
    timeFact: 0,
  }));

  const track = new Tracking({
    IDworker: IDworker,
    IDproject: IDproject,
    IDtask: IDtask,
    attr: dateObj,
  });

  const worker = await Worker.findOne({ _id: IDworker });
  worker.busy = true;

  try {
    await task.save();
    await track.save();
    await worker.save();
    res.status(200).json(task);
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.delete = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id });
  const worker = await Worker.findOne({ _id: task.IDworker });
  worker.busy = false;
  try {
    await Task.deleteOne({ _id: req.params.id });
    await Tracking.deleteOne({ IDtask: req.params.id });
    await worker.save();
    res.status(200).json({ message: "Удаление прошло успешно" });
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.update = async (req, res) => {
  const { name, status, desc, timePlan, timeFact } = req.body;
  const task = await Task.findOne({ _id: req.params.id });

  if (name) task.name = name;
  if (status) {
    task.status = status;
    if (status === "Завершен" || status === "Отменен") {
      const worker = await Worker.findOne({ _id: task.IDworker });
      worker.busy = false;
      await worker.save();
    }
  }
  if (desc) task.desc = desc;
  if (timePlan) task.timePlan = timePlan;
  if (timeFact) task.timeFact = timeFact;
  try {
    await task.save();
    res.status(200).json(task);
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.getById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id });
    if (!task) {
      res.status(404).json({ message: "Задача не найдена" });
      return;
    }
    const worker = await Worker.findOne({ _id: task.IDworker });
    const project = await Project.findOne({ _id: task.IDproject });
    res.status(200).json({ ...task["_doc"], worker: worker, project: project });
  } catch (e) {
    errorHandler(res, e);
  }
};

function getDatesInRange(startDate, endDate) {
  const date = new Date(startDate.getTime());

  const dates = [];

  while (date <= endDate) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return dates;
}
