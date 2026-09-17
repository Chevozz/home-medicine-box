const express = require("express");
const { validate } = require("../middleware/validate");
const { authMiddleware } = require("../middleware/auth");
const { scheduleSchema } = require("../validators/schemas");
const controller = require("../controllers/schedule.controller");

const router = express.Router();
router.use(authMiddleware);
router.route("/").get(controller.list).post(validate(scheduleSchema), controller.create);
router.delete("/:id", controller.remove);
module.exports = router;
