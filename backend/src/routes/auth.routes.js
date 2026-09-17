const express = require("express");
const { validate } = require("../middleware/validate");
const { authMiddleware } = require("../middleware/auth");
const { registerSchema, loginSchema } = require("../validators/schemas");
const controller = require("../controllers/auth.controller");
const profileController = require("../controllers/profile.controller");

const router = express.Router();
router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/forgot-password", controller.forgotPassword);
router.get("/me", authMiddleware, profileController.me);
router.patch("/me", authMiddleware, profileController.update);
module.exports = router;