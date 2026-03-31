const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET - Listar todos los contactos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener contactos' });
  }
});

// POST - Crear contacto
router.post('/', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const result = await pool.query(
      'INSERT INTO contacts (name, phone, email) VALUES ($1, $2, $3) RETURNING *',
      [name, phone, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear contacto' });
  }
});

// PUT - Actualizar contacto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    const result = await pool.query(
      'UPDATE contacts SET name=$1, phone=$2, email=$3 WHERE id=$4 RETURNING *',
      [name, phone, email, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar contacto' });
  }
});

// DELETE - Eliminar contacto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM contacts WHERE id=$1', [id]);
    res.json({ message: 'Contacto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar contacto' });
  }
});

module.exports = router; 