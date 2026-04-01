const API = 'http://localhost:3000/api/contacts';

const colors = ['#f4845f', '#f7c948', '#4fc3f7', '#81c784', '#f48fb1', '#ce93d8'];

function getColor(name) {
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function getInitial(name) {
  return name.charAt(0).toUpperCase();
}

async function loadContacts(search = '') {
  const res = await fetch(API);
  let contacts = await res.json();

  if (search) {
    contacts = contacts.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  const grid = document.getElementById('contacts-grid');
  grid.innerHTML = '';

  contacts.forEach(contact => {
    const color = getColor(contact.name);
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = contact.id;
    card.innerHTML = `
      <button class="btn-delete" onclick="deleteContact(${contact.id})">x</button>
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

loadContacts();

let editingId = null;

function openCreateModal() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Nuevo Contacto';
  document.getElementById('input-name').value = '';
  document.getElementById('input-phone').value = '';
  document.getElementById('input-email').value = '';
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

  await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, email })
  });

  document.getElementById('modal').classList.add('hidden');
  loadContacts();
});