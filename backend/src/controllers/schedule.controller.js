const prisma = require("../config/db");

async function list(req, res, next) {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { medicine: { user_id: req.user.id } },
      orderBy: { time_to_take: "asc" },
      include: { medicine: { select: { id: true, name: true } } },
    });
    res.json(schedules);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { medicine_id, time_to_take, frequency } = req.body;
    const medicine = await prisma.medicine.findFirst({
      where: { id: medicine_id, user_id: req.user.id },
    });
    if (!medicine) return next({ status: 404, isOperational: true, message: "Obat tidak ditemukan" });
    const schedule = await prisma.schedule.create({
      data: { medicine_id, time_to_take, frequency },
    });
    res.status(201).json(schedule);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.schedule.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, remove };
