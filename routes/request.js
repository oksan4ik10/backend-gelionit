const express = require("express");
const router = express.Router();

const controller = require("../controllers/request");

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.delete);
router.get("/manager/unprocessed", controller.getUnprocessed);

module.exports = router;
