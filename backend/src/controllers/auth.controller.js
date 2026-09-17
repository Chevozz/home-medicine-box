const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../config/db");

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return next({ status: 409, isOperational: true, message: "Email sudah terdaftar" });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password_hash } });
    res.status(201).json({ user: { id: user.id, name, email }, token: signToken(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next({ status: 401, isOperational: true, message: "Email atau password salah" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return next({ status: 401, isOperational: true, message: "Email atau password salah" });

    res.json({ user: { id: user.id, name: user.name, email }, token: signToken(user) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true },
    });
    if (!user) return next({ status: 404, isOperational: true, message: "User tidak ditemukan" });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    // In production: generate reset token, send email with link
    console.log(`[FORGOT PASSWORD] Request for: ${email}`);

    if (user) {
      // TODO: Implement actual email sending with reset token
      // const resetToken = generateResetToken(user);
      // await sendResetEmail(user.email, resetToken);
    }

    res.json({ message: "Jika email terdaftar, link reset akan dikirim." });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, forgotPassword };