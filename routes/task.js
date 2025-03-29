const express = require("express");
const router = express.Router();

const controller = require("../controllers/task");

router.get("/project", controller.getAll);
router.get("/user/:id", controller.getTaskUser);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;
