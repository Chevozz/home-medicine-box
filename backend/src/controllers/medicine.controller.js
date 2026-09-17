const prisma = require("../config/db");

async function list(req, res, next) {
  try {
    const medicines = await prisma.medicine.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: "desc" },
    });
    res.json(medicines);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const medicine = await prisma.medicine.findFirst({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!medicine) return next({ status: 404, isOperational: true, message: "Obat tidak ditemukan" });
    res.json(medicine);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, type, dosage_instructions, stock_quantity, expiry_date } = req.body;
    const medicine = await prisma.medicine.create({
      data: {
        name,
        type,
        dosage_instructions,
        stock_quantity,
        expiry_date: new Date(expiry_date),
        user_id: req.user.id,
      },
    });
    res.status(201).json(medicine);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, type, dosage_instructions, stock_quantity, expiry_date } = req.body;
    const existing = await prisma.medicine.findFirst({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!existing) return next({ status: 404, isOperational: true, message: "Obat tidak ditemukan" });

    const medicine = await prisma.medicine.update({
      where: { id: req.params.id },
      data: {
        name,
        type,
        dosage_instructions,
        stock_quantity,
        expiry_date: expiry_date ? new Date(expiry_date) : undefined,
      },
    });
    res.json(medicine);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const existing = await prisma.medicine.findFirst({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!existing) return next({ status: 404, isOperational: true, message: "Obat tidak ditemukan" });
    await prisma.medicine.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
