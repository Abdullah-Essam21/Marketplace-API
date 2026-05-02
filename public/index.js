const API_BASE = "/api";

const state = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || 'buyer' // 'buyer' or 'seller'
};

// DOM Elements
const authSection = document.getElementById('auth-section');
const sellerDashboard = document.getElementById('seller-dashboard');
const buyerDashboard = document.getElementById('buyer-dashboard');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toast = document.getElementById('toast');

// Initialize UI
function init() {
    if (state.token && state.user) {
        showDashboard();
    } else {
        showAuth();
    }
}

function showAuth() {
    authSection.classList.remove('hidden');
    sellerDashboard.classList.add('hidden');
    buyerDashboard.classList.add('hidden');
}

function showDashboard() {
    authSection.classList.add('hidden');
    if (state.role === 'seller') {
        sellerDashboard.classList.remove('hidden');
        buyerDashboard.classList.add('hidden');
        document.getElementById('seller-name').textContent = `Welcome, ${state.user.name}`;
        loadSellerProducts();
    } else {
        buyerDashboard.classList.remove('hidden');
        sellerDashboard.classList.add('hidden');
        document.getElementById('buyer-name').textContent = `Welcome, ${state.user.name}`;
        loadAllProducts();
    }
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Auth Handlers
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.tab-btn.active').classList.remove('active');
        btn.classList.add('active');
        state.role = btn.dataset.role;
        localStorage.setItem('role', state.role);
        
        // Toggle address field for Buyer
        const addressField = document.getElementById('reg-address');
        if (state.role === 'buyer') {
            addressField.classList.remove('hidden');
            addressField.required = true;
        } else {
            addressField.classList.add('hidden');
            addressField.required = false;
        }
    });
});

document.getElementById('show-register').onclick = (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
};

document.getElementById('show-login').onclick = (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
};

document.getElementById('login-btn').onclick = async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_BASE}/${state.role}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            state.token = data.token;
            state.user = data[state.role];
            localStorage.setItem('token', state.token);
            localStorage.setItem('user', JSON.stringify(state.user));
            showToast('Logged in successfully');
            showDashboard();
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
};

document.getElementById('register-btn').onclick = async () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const address = document.getElementById('reg-address').value;

    const body = { name, email, password };
    if (state.role === 'buyer') body.address = address;

    try {
        const res = await fetch(`${API_BASE}/${state.role}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();

        if (res.ok) {
            showToast('Registered successfully! Please login.');
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
};

// Logout
const logout = () => {
    localStorage.clear();
    state.user = null;
    state.token = null;
    showAuth();
};
document.getElementById('logout-btn-seller').onclick = logout;
document.getElementById('logout-btn-buyer').onclick = logout;

// Seller Actions
async function loadSellerProducts() {
    try {
        const res = await fetch(`${API_BASE}/seller/products/0/50`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        const container = document.getElementById('seller-products');
        container.innerHTML = data.products.map(p => `
            <div class="product-item">
                <strong>${p.item_name}</strong>
                <span class="price-tag">$${p.price}</span>
                <p>${p.description}</p>
                <small>Clicks: ${p.clicks || 0}</small>
                <button onclick="deleteProduct('${p._id}')" class="secondary-btn" style="padding: 2px 8px; font-size: 0.8rem; margin-top: 5px;">Delete</button>
            </div>
        `).join('') || '<p>No products found.</p>';
    } catch (err) {
        showToast('Failed to load products', 'error');
    }
}

document.getElementById('add-product-btn').onclick = async () => {
    const item_name = document.getElementById('prod-name').value;
    const description = document.getElementById('prod-desc').value;
    const category = document.getElementById('prod-cat').value;
    const price = document.getElementById('prod-price').value;

    try {
        const res = await fetch(`${API_BASE}/seller/product/add`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ item_name, description, category, price })
        });
        if (res.ok) {
            showToast('Product added!');
            loadSellerProducts();
        } else {
            showToast('Failed to add product', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
};

window.deleteProduct = async (id) => {
    try {
        const res = await fetch(`${API_BASE}/seller/product/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        if (res.ok) {
            showToast('Product deleted');
            loadSellerProducts();
        }
    } catch (err) {
        showToast('Error deleting product', 'error');
    }
};

// Buyer Actions
async function loadAllProducts() {
    try {
        const res = await fetch(`${API_BASE}/buyer/products`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        const container = document.getElementById('available-products');
        container.innerHTML = data.products.map(p => `
            <div class="product-card">
                <h3>${p.item_name}</h3>
                <p>${p.description}</p>
                <span class="price-tag">$${p.price}</span>
                <button onclick="buyProduct('${p._id}')" class="primary-btn">Buy Now</button>
            </div>
        `).join('') || '<p>No products available.</p>';
    } catch (err) {
        showToast('Failed to load marketplace', 'error');
    }
}

window.buyProduct = async (id) => {
    try {
        const res = await fetch(`${API_BASE}/buyer/buy/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Purchase successful!');
            loadAllProducts();
        } else {
            showToast(data.message || 'Purchase failed', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
};

init();
