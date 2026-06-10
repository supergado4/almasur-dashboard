const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const pool = require("../db");

const router = express.Router();

// Rate limit: máx 10 intentos por IP cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Demasiados intentos. Intenta de nuevo en 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña requeridos" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, password_hash, name, role, organization, avatar FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    // Comparación en tiempo constante (evita timing attacks)
    const dummyHash = "$2a$12$invalidhashfortimingprotectiononly000000000000000000000";
    const hash = user?.password_hash ?? dummyHash;
    const match = await bcrypt.compare(password, hash);

    if (!user || !match) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const payload = {
      id:           user.id,
      email:        user.email,
      name:         user.name,
      role:         user.role,
      organization: user.organization,
      avatar:       user.avatar,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    return res.json({ token, user: payload });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/auth/me — valida token y devuelve usuario
const { requireAuth } = require("../middleware/auth");
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
