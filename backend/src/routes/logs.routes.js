const express = require("express");
const { validate } = require("../middleware/validate");
const { authMiddleware } = require("../middleware/auth");
const { logSchema } = require("../validators/schemas");
const controller = require("../controllers/log.controller");

const router = express.Router();
router.use(authMiddleware);
router.route("/").get(controller.list).post(validate(logSchema), controller.create);
module.exports = router;
