const prisma = require("../config/db");

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

async function update(req, res, next) {
  try {
    const { name } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      select: { id: true, name: true, email: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { me, update };
