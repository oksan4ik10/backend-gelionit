const errorHandler = require("../utils/errorHandler");

const Worker = require("../models/Worker");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Track = require("../models/Tracking");

const ObjectId = require("mongodb").ObjectId;

module.exports.plan = async (req, res) => {
  if (req.params.IDproject === "-1") {
    res.status(200).json();
    return;
  }
  try {
    const project = await Project.findOne({ _id: req.params.IDproject });

    const data = [];
    const year = new Date().getFullYear();

    const monthStart = new Date(project.date_start).getMonth();
    const monthProjectEnd = new Date(project.date_end).getMonth();
    const monthNow = new Date("2025-06-17").getMonth();

    const monthEnd = monthProjectEnd > monthNow ? monthNow : monthProjectEnd;

    let countSort = 0;
    const arr = [];
    for (let i = monthStart; i <= monthEnd; i++) {
      arr.push(i);
    }

    const months = Array.from(new Set(arr)).map((item) => {
      const start = new Date(year, item, 2);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(
        year,
        item,
        new Date(year, item + 1, 0).getDate() + 1
      );
      end.setUTCHours(23, 59, 59, 59);
      const monthName = `${start.toLocaleString("default", {
        month: "long",
      })}, ${year}`;
      countSort++;
      return { start, end, monthName, countSort };
    });
    console.log(months);

    await Promise.all(
      months.map(async (item) => {
        const test = await Track.aggregate([
          { $match: { IDproject: new ObjectId(req.params.IDproject) } },
          { $unwind: "$attr" },
          { $match: { "attr.dateWork": { $lte: item.end, $gte: item.start } } },
          {
            $group: {
              _id: "$IDworker",
              timePlan: { $sum: "$attr.timePlan" },
              timeFact: { $sum: "$attr.timeFact" },
            },
          },
          {
            $lookup: {
              from: "workers",
              localField: "_id",
              foreignField: "_id",
              as: "result",
            },
          },
          { $unwind: "$result" },
          {
            $project: {
              timePlan: 1,
              timeFact: 1,
              FOTfact: { $multiply: ["$result.salary", "$timeFact"] },
              FOTplan: { $multiply: ["$result.salary", "$timePlan"] },
              idLine: "1",
              count: { $add: [1] },
            },
          },
          {
            $group: {
              _id: "$idLine",
              timePlan: { $sum: "$timePlan" },
              timeFact: { $sum: "$timeFact" },
              FOTfact: { $sum: "$FOTfact" },
              FOTplan: { $sum: "$FOTplan" },
              countWorkers: { $sum: "$count" },
            },
          },
          {
            $project: {
              timePlan: 1,
              countWorkers: 1,
              timeFact: 1,
              timeProc: {
                $multiply: [{ $divide: ["$timeFact", "$timePlan"] }, 100],
              },
              FOTplan: 1,
              FOTfact: 1,
              month: item.monthName,
              countSort: String(item.countSort),
            },
          },
        ]);

        data.push(test[0]);
      })
    );

    let sumTime = 0;
    const dataRes = data
      .filter((item) => item)
      .sort((a, b) => (+a.countSort > +b.countSort ? 1 : -1))
      .map((item) => {
        sumTime += item.timeFact;
        item.timeProgress = sumTime;
        return item;
      });
    res.status(200).json({ data: dataRes, project: project });
  } catch (e) {
    console.log(e);

    res.status(500).json(e);
  }
};
