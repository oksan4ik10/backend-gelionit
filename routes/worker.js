const express = require("express");
const router = express.Router();

const { session } = require("passport");
const passport = require("passport");
const controller = require("../controllers/worker");

// router.get('/', passport.authenticate('jwt', {session: false}), controller.getAll);
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  controller.getAll
);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.delete);
router.get("/busy/free", controller.getBusyFree);

module.exports = router;
