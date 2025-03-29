const errorHandler = require("../utils/errorHandler");

const Worker = require("../models/Worker");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Track = require("../models/Tracking");

module.exports.getByTask = async (req, res) => {
  try {
    const track = await Track.findOne({ IDtask: req.params.IDtask });
    const project = await Project.findOne({ _id: track.IDproject });
    const worker = await Worker.findOne({ _id: track.IDworker });
    const task = await Task.findOne({ _id: track.IDtask });
    res
      .status(200)
      .json({ ...track["_doc"], project: project, worker: worker, task: task });
  } catch (e) {
    errorHandler(res, e);
  }
};
module.exports.update = async (req, res) => {
  const { attr } = req.body;
  try {
    const track = await Track.findOne({ IDtask: req.params.IDtask });
    if (attr) {
      track.attr = attr;
    }

    await track.save();
    res.status(200).json(track);
  } catch (e) {
    errorHandler(res, e);
  }
};

module.exports.updateDateFact = async (req, res) => {
  try {
    const { dateWork, timeFact } = req.body;
    const track = await Track.findOne({ IDtask: req.params.IDtask });
    const getTimeNewDate = new Date(dateWork).getTime();
    let isDate = false;
    track.attr = track.attr.map((item) => {
      if (item.dateWork.getTime() === getTimeNewDate) {
        item.timeFact = timeFact;
        isDate = true;
      }
      return item;
    });
    if (!isDate) track.attr.push({ ...req.body, timePlan: 0 });
    await track.save();
    res.status(200).json(track);
  } catch (e) {
    errorHandler(res, e);
  }
};
