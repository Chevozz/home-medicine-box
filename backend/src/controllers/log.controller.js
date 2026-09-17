const prisma = require("../config/db");

async function list(req, res, next) {
  try {
    const logs = await prisma.consumptionLog.findMany({
      where: { user_id: req.user.id },
      orderBy: { consumed_at: "desc" },
      take: 50,
      include: { medicine: { select: { id: true, name: true } } },
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { medicine_id, status } = req.body;

    // Transaction: Log entry + Deduct stock
    const result = await prisma.$transaction(async (tx) => {
      const log = await tx.consumptionLog.create({
        data: { medicine_id, user_id: req.user.id, status },
      });

      if (status === "Taken") {
        await tx.medicine.update({
          where: { id: medicine_id },
          data: { stock_quantity: { decrement: 1 } },
        });
      }
      return log;
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };
