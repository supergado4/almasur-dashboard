/**
 * Seed inicial de usuarios.
 * Uso: node server/seed.js
 * Requiere DATABASE_URL en .env
 */
require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const users = [
  {
    email: "carla.medici@almasur.cl",
    password: process.env.SEED_PASSWORD_CARLA || "carla123",
    name: "Carla Medici",
    role: "Gerente Comercial",
    organization: "Inversiones Almasur",
    avatar: "CM",
  },
  {
    email: "juan.p@jpedesign.cl",
    password: process.env.SEED_PASSWORD_JUAN || "juan123",
    name: "Juan F. Pérez",
    role: "Growth Consultant",
    organization: "JPEdesign",
    avatar: "JP",
  },
];

async function seed() {
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    await pool.query(
      `INSERT INTO users (email, password_hash, name, role, organization, avatar)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             name          = EXCLUDED.name,
             role          = EXCLUDED.role,
             organization  = EXCLUDED.organization,
             avatar        = EXCLUDED.avatar`,
      [u.email, hash, u.name, u.role, u.organization, u.avatar]
    );
    console.log(`✓ Usuario seedeado: ${u.email}`);
  }
  await pool.end();
  console.log("Seed completado.");
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
