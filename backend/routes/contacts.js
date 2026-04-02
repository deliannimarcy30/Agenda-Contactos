const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const verifyToken = require('../middleware/auth');

// GET - Listar contactos del usuario
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contacts WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener contactos' });
  }
});

// POST - Crear contacto
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const result = await pool.query(
      'INSERT INTO contacts (name, phone, email, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, phone, email, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al crear contacto' });
  }
});

// PUT - Actualizar contacto
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    const result = await pool.query(
      'UPDATE contacts SET name=$1, phone=$2, email=$3 WHERE id=$4 AND user_id=$5 RETURNING *',
      [name, phone, email, id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar contacto' });
  }
});

// DELETE - Eliminar contacto
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'DELETE FROM contacts WHERE id=$1 AND user_id=$2',
      [id, req.user.id]
    );
    res.json({ message: 'Contacto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar contacto' });
  }
});

module.exports = router;