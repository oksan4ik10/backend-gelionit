const express = require("express");
const router = express.Router();

const controller = require("../controllers/analytics");

router.get("/plan/:IDproject", controller.plan);
// router.get("/temp", controller.temp);
// router.get("/statistics", controller.statistics);

module.exports = router;
