const express = require("express");
const { validate } = require("../middleware/validate");
const { authMiddleware } = require("../middleware/auth");
const { medicineSchema } = require("../validators/schemas");
const controller = require("../controllers/medicine.controller");

const router = express.Router();
router.use(authMiddleware);
router.route("/").get(controller.list).post(validate(medicineSchema), controller.create);
router.route("/:id").get(controller.getById).put(validate(medicineSchema), controller.update).delete(controller.remove);
module.exports = router;
