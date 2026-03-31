const express = require('express');
const cors = require('cors');
require('dotenv').config();

const contactsRouter = require('./routes/contacts');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/api/contacts', contactsRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
}); 