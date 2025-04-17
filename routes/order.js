const express = require("express");
const router = express.Router();
const { session } = require("passport");
const passport = require("passport");
const controller = require("../controllers/order");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  controller.getAll
);
router.get("/history/:id", controller.getHistoryById);
router.post("/", controller.create);
router.patch("/:id", controller.update);
// router.delete("/:id", controller.delete);

module.exports = router;
