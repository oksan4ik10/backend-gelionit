const errorHandler = require("../utils/errorHandler");

const Project = require("../models/Project");
const Worker = require("../models/Worker");

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

    const projects = await Project.find(keysQuery).sort(paramOrdering);

    const dataPromise = await Promise.all(
      projects.map(async (item) => {
        const worker = await Worker.findOne({ _id: item.idResponsibleUser });
        let obj = Object.assign({}, item);
        obj["worker"] = worker;
        return obj;
      })
    );

    const data = dataPromise.map((item) => ({
      ...item["_doc"],
      worker: item["worker"],
    }));
    res.status(200).json(data);
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.create = async (req, res) => {
  const { name, timePlan, idResponsibleUser, date_start, date_end, desc } =
    req.body;

  const project = new Project({
    name: name,
    timePlan: timePlan,
    idResponsibleUser: idResponsibleUser,
    date_start: date_start,
    date_end: date_end,
    desc: desc ? desc : "",
  });

  try {
    await project.save();
    res.status(200).json(project);
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.delete = async (req, res) => {
  try {
    await Project.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Удаление прошло успешно" });
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.update = async (req, res) => {
  const { name, timePlan, idResponsibleUser, date_start, date_end, desc } =
    req.body;
  console.log(req.body);
  const project = await Project.findOne({ _id: req.params.id });
  if (name) project.name = name;
  if (timePlan) project.timePlan = timePlan;
  if (idResponsibleUser) project.idResponsibleUser = idResponsibleUser;
  if (date_start) project.date_start = date_start;
  if (date_end) project.date_end = date_end;
  if (desc) project.desc = desc;

  try {
    await project.save();
    res.status(200).json(project);
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.getById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id });
    if (!project) {
      res.status(404).json({
        message: "Проект не найден",
      });
    }

    const worker = await Worker.findOne({ _id: project.idResponsibleUser });
    res.status(200).json({ ...project["_doc"], worker: worker });
  } catch (e) {
    errorHandler(res, e);
  }
};
