const API = 'http://localhost:3000/api/contacts';

const colors = ['#f69a7b', '#f9db88', '#90c8f8', '#a7fcab', '#f8a4c0', '#e999f7'];

function getColor(id) {
  return colors[id % colors.length];
}

function getInitial(name) {
  return name.charAt(0).toUpperCase();
}

async function loadContacts(search = '') {
  const res = await fetch(API);
  let contacts = await res.json();

  if (search) {
    contacts = contacts.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );
  }

  const grid = document.getElementById('contacts-grid');
  const count = document.getElementById('contact-count');
  grid.innerHTML = '';

  count.textContent = `${contacts.length} contacto${contacts.length !== 1 ? 's' : ''} encontrado${contacts.length !== 1 ? 's' : ''}`;

  if (contacts.length === 0) {
    grid.innerHTML = '<p class="empty-message">No se encontraron contactos</p>';
    return;
  }

  contacts.forEach(contact => {
    const color = getColor(contact.id);
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = contact.id;
    card.style.borderTopColor = color;
    card.innerHTML = `
      <button class="btn-delete" onclick="deleteContact(${contact.id})">✕</button>
      <div class="card-header">
        <div class="avatar" style="background-color:${color}">
          ${getInitial(contact.name)}
        </div>
        <div class="card-name" style="color:${color}">${contact.name}</div>
      </div>
      <div class="card-info">
        <p><span>Teléfono:</span> ${contact.phone}</p>
        <p><span>Email:</span> ${contact.email || 'N/A'}</p>
      </div>
    `;
    card.addEventListener('dblclick', () => openEditModal(contact));
    grid.appendChild(card);
  });
}

document.getElementById('search').addEventListener('input', (e) => {
  loadContacts(e.target.value);
});

document.getElementById('btn-nuevo').addEventListener('click', () => {
  openCreateModal();
});

let editingId = null;

function openCreateModal() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Nuevo Contacto';
  document.getElementById('input-name').value = '';
  document.getElementById('input-phone').value = '';
  document.getElementById('input-email').value = '';
  document.getElementById('modal').classList.remove('hidden');
}

function openEditModal(contact) {
  editingId = contact.id;
  document.getElementById('modal-title').textContent = 'Editar Contacto';
  document.getElementById('input-name').value = contact.name;
  document.getElementById('input-phone').value = contact.phone;
  document.getElementById('input-email').value = contact.email || '';
  document.getElementById('modal').classList.remove('hidden');
}

document.getElementById('btn-cancel').addEventListener('click', () => {
  document.getElementById('modal').classList.add('hidden');
});

document.getElementById('btn-save').addEventListener('click', async () => {
  const name = document.getElementById('input-name').value.trim();
  const phone = document.getElementById('input-phone').value.trim();
  const email = document.getElementById('input-email').value.trim();

  if (!name || !phone) {
    alert('Nombre y teléfono son obligatorios');
    return;
  }

  const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
  if (!phoneRegex.test(phone)) {
    alert('El teléfono solo puede contener números, espacios, +, - y paréntesis. Mínimo 7 dígitos.');
    return;
  }

  if (editingId) {
    await fetch(`${API}/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email })
    });
  } else {
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email })
    });
  }

  document.getElementById('modal').classList.add('hidden');
  loadContacts();
});

async function deleteContact(id) {
  if (confirm('¿Estás segura de que deseas eliminar este contacto?')) {
    await fetch(`${API}/${id}`, {
      method: 'DELETE'
    });
    loadContacts();
  }
}

loadContacts();