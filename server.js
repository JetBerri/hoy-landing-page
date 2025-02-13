const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
app.use(express.json());

// Config BD
const dbConfig = {
  host: "0.0.0.0",
  user: "hoyuser",     // tu usuario MySQL
  password: "hoypass", // tu contraseña
  database: "house_of_young"
};

// Servir la carpeta "public" donde estará tu index.html, locs.json, etc.
app.use(express.static(path.join(__dirname, "public")));

// /api/register: recibe datos del formulario
app.post("/api/register", async (req, res) => {
  const { nombre, email, zonaValencia } = req.body;

  if(!nombre || !email || !zonaValencia) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);

    // Crear tabla si no existe
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100),
        email VARCHAR(100),
        zonaValencia VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar registro
    await conn.execute(`
      INSERT INTO registrations (nombre, email, zonaValencia)
      VALUES (?, ?, ?)
    `, [nombre, email, zonaValencia]);

    res.json({ message: "Registro guardado con éxito" });
  } catch (err) {
    console.error("Error en la base de datos:", err);
    res.status(500).json({ message: "Error interno al guardar", error: err.message });
  } finally {
    if (conn) {
      await conn.end();
    }
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Servidor escuchando en http://0.0.0.0:" + PORT);
});
