const express = require("express");
const router = express.Router();

const controller = require('../controllers/tracking')

router.get('/:IDtask', controller.getByTask);
router.patch('/addDate/:IDtask', controller.updateDateFact);
router.patch('/editData/:IDtask', controller.update);


module.exports = router