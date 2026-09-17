const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const medicineSchema = z.object({
  name: z.string().min(1, "Nama obat wajib diisi"),
  type: z.string().min(1, "Jenis obat wajib diisi"),
  dosage_instructions: z.string().min(1, "Dosis wajib diisi"),
  stock_quantity: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
  expiry_date: z.string().datetime(),
});

const scheduleSchema = z.object({
  medicine_id: z.string().uuid(),
  time_to_take: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu HH:mm"),
  frequency: z.string().min(1, "Frekuensi wajib diisi"),
});

const logSchema = z.object({
  medicine_id: z.string().uuid(),
  status: z.enum(["Taken", "Missed"]),
});

module.exports = { registerSchema, loginSchema, medicineSchema, scheduleSchema, logSchema };
