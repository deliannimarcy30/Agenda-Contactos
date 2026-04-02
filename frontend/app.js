const API = 'http://localhost:3000/api/contacts';
const AUTH = 'http://localhost:3000/api/auth';

const colors = ['#efa991', '#f6e0a3', '#99c9f3', '#c3ffc6', '#f9c3d5', '#ecb5f6'];

function getColor(id) {
  return colors[id % colors.length];
}

function getInitial(name) {
  return name.charAt(0).toUpperCase();
}

function getToken() {
  return localStorage.getItem('token');
}

function switchPanel() {
  const isLogin = !document.getElementById('form-login').classList.contains('hidden');
  const left = document.getElementById('auth-left-title');
  const subtitle = document.getElementById('auth-left-subtitle');
  const btnSwitch = document.getElementById('btn-switch');

  if (isLogin) {
    document.getElementById('form-login').classList.add('hidden');
    document.getElementById('form-register').classList.remove('hidden');
    left.textContent = '¿Ya tienes cuenta?';
    subtitle.textContent = 'Inicia sesión para acceder a tu agenda';
    btnSwitch.textContent = 'Iniciar Sesión';
  } else {
    document.getElementById('form-login').classList.remove('hidden');
    document.getElementById('form-register').classList.add('hidden');
    left.textContent = 'Bienvenido de nuevo';
    subtitle.textContent = 'Inicia sesión para acceder a tu agenda personal';
    btnSwitch.textContent = 'Registrarse';
  }
}

async function login() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const error = document.getElementById('login-error');

  if (!username || !password) {
    error.textContent = 'Completa todos los campos';
    return;
  }

  const res = await fetch(`${AUTH}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!res.ok) {
    error.textContent = data.error;
    return;
  }

  localStorage.setItem('token', data.token);
  localStorage.setItem('username', data.username);
  showMainScreen();
}

async function register() {
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value.trim();
  const confirm = document.getElementById('register-confirm').value.trim();
  const error = document.getElementById('register-error');

  if (!username || !password || !confirm) {
    error.textContent = 'Completa todos los campos';
    return;
  }

  if (password !== confirm) {
    error.textContent = 'Las contraseñas no coinciden';
    return;
  }

  const res = await fetch(`${AUTH}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!res.ok) {
    error.textContent = data.error;
    return;
  }

  document.getElementById('register-error').style.color = '#4fc3f7';
  error.textContent = 'Cuenta creada. Inicia sesión.';
  switchPanel();
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  document.getElementById('main-screen').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
}

function showMainScreen() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('main-screen').classList.remove('hidden');
  document.getElementById('welcome-user').textContent = `Hola, ${localStorage.getItem('username')}`;
  loadContacts();
}

async function loadContacts(search = '') {
  const res = await fetch(API, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });

  if (res.status === 401 || res.status === 403) {
    logout();
    return;
  }

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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ name, phone, email })
    });
  } else {
    await fetch(API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ name, phone, email })
    });
  }

  document.getElementById('modal').classList.add('hidden');
  loadContacts();
});

async function deleteContact(id) {
  if (confirm('¿Estás segura de que deseas eliminar este contacto?')) {
    await fetch(`${API}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    loadContacts();
  }
}

if (getToken()) {
  showMainScreen();
} else {
  document.getElementById('auth-screen').classList.remove('hidden');
} 