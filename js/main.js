// ================================================================
//  FARAJA PLATFORM — Core JavaScript
// ================================================================

'use strict';

// ─── Navbar scroll effect ─────────────────────────────────────
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ─── Mobile hamburger ─────────────────────────────────────────
const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.querySelector('.nav-mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    hamburger.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
  });
}

// ─── Sidebar toggle (dashboard) ───────────────────────────────
const sidebarToggle = document.querySelector('.sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
  // Close sidebar on outside click
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

// ─── Active nav link (sidebar) ───────────────────────────────
(function setActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) link.classList.add('active');
  });
})();

// ─── Modal helpers ────────────────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal || modal.classList.contains('closing')) return;
  modal.classList.add('closing');
  setTimeout(() => {
    modal.classList.remove('open', 'closing');
    document.body.style.overflow = '';
  }, 200);
}
// Close modal on overlay click or X button
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal-overlay');
    if (modal) closeModal(modal.id);
  });
});
// Esc key closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
  }
});

// ─── Toast notifications ──────────────────────────────────────
function showToast(message, type = 'info', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Form validation helpers ──────────────────────────────────
const validators = {
  required: (v) => v.trim() !== '' || 'This field is required',
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address',
  phone: (v) => /^(\+254|0)[17]\d{8}$/.test(v.replace(/\s/g,'')) || 'Enter a valid Kenyan phone (07xx or +2547xx)',
  minLen: (n) => (v) => v.length >= n || `Must be at least ${n} characters`,
  maxLen: (n) => (v) => v.length <= n || `Must be at most ${n} characters`,
  match: (other) => (v, form) => v === form.querySelector(`[name="${other}"]`)?.value || 'Passwords do not match',
  positive: (v) => parseFloat(v) > 0 || 'Must be a positive number',
  date: (v) => !isNaN(Date.parse(v)) || 'Enter a valid date',
};

function validateField(input, rules, form) {
  const val = input.value;
  for (const rule of rules) {
    const result = rule(val, form);
    if (result !== true) {
      setFieldError(input, result);
      return false;
    }
  }
  setFieldSuccess(input);
  return true;
}

function setFieldError(input, message) {
  input.classList.add('error');
  input.classList.remove('success');
  let err = input.parentElement.querySelector('.form-error');
  if (!err) {
    err = document.createElement('div');
    err.className = 'form-error';
    input.parentElement.appendChild(err);
  }
  err.textContent = '⚠ ' + message;
}

function setFieldSuccess(input) {
  input.classList.remove('error');
  input.classList.add('success');
  const err = input.parentElement.querySelector('.form-error');
  if (err) err.remove();
}

function clearFieldState(input) {
  input.classList.remove('error', 'success');
  const err = input.parentElement.querySelector('.form-error');
  if (err) err.remove();
}

// ─── Password strength indicator ──────────────────────────────
function setupPasswordStrength(inputEl, indicatorEl) {
  if (!inputEl || !indicatorEl) return;
  inputEl.addEventListener('input', () => {
    const val = inputEl.value;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    indicatorEl.className = 'password-strength';
    if (score <= 1) indicatorEl.classList.add('strength-weak');
    else if (score <= 3) indicatorEl.classList.add('strength-medium');
    else indicatorEl.classList.add('strength-strong');
    indicatorEl.style.display = val ? 'block' : 'none';
  });
  indicatorEl.style.display = 'none';
}

// ─── Toggle password visibility ───────────────────────────────
document.querySelectorAll('[data-toggle-password]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.togglePassword);
    if (!target) return;
    target.type = target.type === 'password' ? 'text' : 'password';
    btn.textContent = target.type === 'password' ? '👁' : '🙈';
  });
});

// ─── Tab switcher ─────────────────────────────────────────────
document.querySelectorAll('.tab-bar').forEach(tabBar => {
  tabBar.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabBar.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      if (target) {
        const panelContainer = tabBar.closest('.tab-container') || tabBar.nextElementSibling;
        if (panelContainer) {
          panelContainer.querySelectorAll('[data-tab-panel]').forEach(p => {
            p.style.display = p.dataset.tabPanel === target ? 'block' : 'none';
          });
        }
      }
    });
  });
});

// ─── Dropdown toggles ─────────────────────────────────────────
document.querySelectorAll('[data-dropdown]').forEach(trigger => {
  const menuId = trigger.dataset.dropdown;
  const menu = document.getElementById(menuId);
  if (!menu) return;
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('open');
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    if (!isOpen) menu.classList.add('open');
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
});

// ─── Multi-step form logic ────────────────────────────────────
function initMultiStep(formEl) {
  if (!formEl) return;
  const panels = formEl.querySelectorAll('.step-panel');
  const dots = formEl.querySelectorAll('.step-dot');
  const lines = formEl.querySelectorAll('.step-line');
  let current = 0;

  function goTo(n) {
    panels.forEach((p, i) => p.classList.toggle('active', i === n));
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === n);
      d.classList.toggle('done', i < n);
    });
    lines.forEach((l, i) => l.classList.toggle('done', i < n));
    current = n;
    window.scrollTo({ top: formEl.offsetTop - 100, behavior: 'smooth' });
  }

  formEl.querySelectorAll('[data-step-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (current < panels.length - 1) goTo(current + 1);
    });
  });
  formEl.querySelectorAll('[data-step-prev]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (current > 0) goTo(current - 1);
    });
  });

  goTo(0);
}
document.querySelectorAll('[data-multistep]').forEach(initMultiStep);

// ─── Progress bar animation ───────────────────────────────────
function animateProgress(el) {
  const target = parseFloat(el.dataset.progress) || 0;
  el.style.width = '0%';
  requestAnimationFrame(() => {
    setTimeout(() => { el.style.width = Math.min(target, 100) + '%'; }, 50);
  });
}
document.querySelectorAll('.progress-bar[data-progress]').forEach(bar => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateProgress(bar); observer.disconnect(); } });
  }, { threshold: 0.3 });
  observer.observe(bar);
});

// ─── Counter animation ────────────────────────────────────────
function animateCounter(el) {
  const target = parseFloat(el.dataset.count) || 0;
  const duration = 1500;
  const start = performance.now();
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const isFloat = target % 1 !== 0;
  function update(ts) {
    const elapsed = ts - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = target * eased;
    el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
document.querySelectorAll('[data-count]').forEach(el => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounter(el); observer.disconnect(); } });
  }, { threshold: 0.5 });
  observer.observe(el);
});

// ─── Donut ring chart ─────────────────────────────────────────
function drawRing(el) {
  const pct = parseFloat(el.dataset.ring) || 0;
  const svg = el.querySelector('svg');
  const fill = el.querySelector('.ring-fill');
  if (!svg || !fill) return;
  const r = 50;
  const circ = 2 * Math.PI * r;
  svg.setAttribute('viewBox', '0 0 120 120');
  fill.setAttribute('cx', 60); fill.setAttribute('cy', 60); fill.setAttribute('r', r);
  const bg = el.querySelector('.ring-bg');
  if (bg) { bg.setAttribute('cx', 60); bg.setAttribute('cy', 60); bg.setAttribute('r', r); }
  fill.style.strokeDasharray = circ;
  fill.style.strokeDashoffset = circ;
  setTimeout(() => { fill.style.strokeDashoffset = circ * (1 - pct / 100); }, 200);
}
document.querySelectorAll('.ring-chart[data-ring]').forEach(drawRing);

// ─── Amount preset buttons (donation page) ────────────────────
document.querySelectorAll('.amount-btn[data-amount]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const amountInput = document.getElementById('donationAmount') || document.getElementById('customAmount');
    if (amountInput) amountInput.value = btn.dataset.amount;
  });
});

// ─── Copy link helper ─────────────────────────────────────────
document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.dataset.copy || window.location.href;
    navigator.clipboard.writeText(text).then(() => showToast('Link copied to clipboard!', 'success'));
  });
});

// ─── File upload preview ──────────────────────────────────────
function setupFileUpload(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input || !preview) return;
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (preview.tagName === 'IMG') { preview.src = e.target.result; preview.style.display = 'block'; }
      else { preview.style.backgroundImage = `url(${e.target.result})`; preview.textContent = ''; }
    };
    reader.readAsDataURL(file);
  });
}

// ─── Fake API simulation (DEPRECATED — kept for reference only) ──
// This entire block has been superseded by the REAL API client below,
// which talks to the actual Express/MySQL backend at API_BASE instead
// of localStorage. Left here (commented out) instead of deleted so the
// previous data shapes/method names are easy to cross-check if needed.
/*
const FarajaAPI = {
  baseDelay: 600,
  delay: (ms) => new Promise(r => setTimeout(r, ms || FarajaAPI.baseDelay)),

  // Auth
  login: async (email, password) => {
    await FarajaAPI.delay();
    if (email && password.length >= 6) {
      const user = { id: 1, name: 'John Kamau', email, role: 'admin', avatar: null };
      localStorage.setItem('faraja_user', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: 'Invalid email or password' };
  },
  register: async (data) => {
    await FarajaAPI.delay(800);
    const user = { id: Date.now(), ...data, role: 'user' };
    localStorage.setItem('faraja_user', JSON.stringify(user));
    return { success: true, user };
  },
  logout: () => {
    localStorage.removeItem('faraja_user');
    window.location.href = 'login.html';
  },
  currentUser: () => {
    try { return JSON.parse(localStorage.getItem('faraja_user')); } catch { return null; }
  },

  // Funerals
  saveFuneral: async (data) => {
    await FarajaAPI.delay(700);
    const funerals = JSON.parse(localStorage.getItem('faraja_funerals') || '[]');
    const funeral = { id: 'fun_' + Date.now(), ...data, createdAt: new Date().toISOString(), raised: 0, goal: data.goal || 500000 };
    funerals.push(funeral);
    localStorage.setItem('faraja_funerals', JSON.stringify(funerals));
    return { success: true, funeral };
  },

  // Contributions
  getContributions: async (funeralId) => {
    await FarajaAPI.delay(400);
    const all = JSON.parse(localStorage.getItem('faraja_contributions') || '[]');
    return funeralId ? all.filter(c => c.funeralId === funeralId) : all;
  },
  saveContribution: async (data) => {
    await FarajaAPI.delay(800);
    const contributions = JSON.parse(localStorage.getItem('faraja_contributions') || '[]');
    const c = { id: 'con_' + Date.now(), ...data, createdAt: new Date().toISOString() };
    contributions.push(c);
    localStorage.setItem('faraja_contributions', JSON.stringify(contributions));
    return { success: true, contribution: c };
  },

  // Tasks
  getTasks: async (funeralId) => {
    await FarajaAPI.delay(300);
    const all = JSON.parse(localStorage.getItem('faraja_tasks') || '[]');
    return funeralId ? all.filter(t => t.funeralId === funeralId) : all;
  },
  saveTask: async (data) => {
    await FarajaAPI.delay(500);
    const tasks = JSON.parse(localStorage.getItem('faraja_tasks') || '[]');
    const t = { id: 'task_' + Date.now(), ...data, createdAt: new Date().toISOString() };
    tasks.push(t);
    localStorage.setItem('faraja_tasks', JSON.stringify(tasks));
    return { success: true, task: t };
  },

  // M-PESA STK Push (sandbox simulation)
  mpesaSTKPush: async ({ phone, amount, funeralId }) => {
    await FarajaAPI.delay(1200);
    const ref = 'MP' + Math.random().toString(36).substr(2, 8).toUpperCase();
    // In production: call Safaricom Daraja API
    return { success: true, checkoutRequestID: ref, message: `STK push sent to ${phone}. Enter M-PESA PIN to complete.` };
  }
};
*/

// ─── Active funeral helper ─────────────────────────────────────
// Internal management pages (dashboard, committee, tasks, financials,
// contributions) need to know WHICH funeral the logged-in user is
// currently managing. We store that single ID in localStorage the
// moment the user clicks "Manage" on a memorial card, and every
// management page reads it back on load.
// donate.html is different: it's a PUBLIC page shared via WhatsApp/SMS
// links, so it can't rely on a localStorage value — it reads the
// funeral ID from the URL query string instead (donate.html?id=12).
const ActiveFuneral = {
  set:   (id) => localStorage.setItem('faraja_active_funeral', id),
  get:   () => localStorage.getItem('faraja_active_funeral'),
  clear: () => localStorage.removeItem('faraja_active_funeral'),
};

// ─── REAL API client ────────────────────────────────────────────
// Talks to the actual Express/MySQL backend (js/Backend) instead of
// localStorage. Update API_BASE if your backend runs somewhere other
// than localhost:5000 (e.g. a Laragon virtual host).
const API_BASE = 'http://localhost:5000/api';

async function apiRequest(path, { method = 'GET', body, isFormData = false, auth = true } = {}) {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = localStorage.getItem('faraja_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data; // { success, message, data }
}

// ── Field mapping helpers (snake_case → camelCase) ──────────
function mapVendor(v) {
  if (!v) return null;
  return {
    id: v.id, userId: v.user_id, businessName: v.business_name,
    category: v.category, location: v.location, phone: v.phone, email: v.email,
    description: v.description, rating: Number(v.rating), verified: !!v.verified,
    views: v.views, status: v.status, createdAt: v.created_at, updatedAt: v.updated_at,
  };
}
function mapProduct(p) {
  if (!p) return null;
  return {
    id: p.id, vendorId: p.vendor_id, name: p.name, category: p.category,
    price: Number(p.price), stock: p.stock != null ? Number(p.stock) : null, description: p.description,
    imageUrl: p.image_url, status: p.status, createdAt: p.created_at, updatedAt: p.updated_at,
  };
}
function mapAdminUser(u) {
  if (!u) return null;
  return {
    id: u.id, name: u.name, email: u.email, phone: u.phone,
    role: u.role, status: u.status || (u.is_active ? 'active' : 'suspended'),
    createdAt: u.created_at || u.createdAt,
  };
}
function mapBooking(b) {
  if (!b) return null;
  return {
    id: b.id, funeralId: b.funeral_id, vendorId: b.vendor_id, productId: b.product_id,
    requestedBy: b.requested_by, serviceDate: b.service_date, amount: Number(b.amount),
    commissionPct: Number(b.commission_pct), commissionAmount: Number(b.commission_amount),
    status: b.status, notes: b.notes, createdAt: b.created_at, updatedAt: b.updated_at,
    vendorName: b.vendor_name, vendorCategory: b.vendor_category,
    productName: b.product_name, requesterName: b.requester_name,
    deceasedName: b.deceased_name, funeralDate: b.funeral_date, venue: b.venue,
  };
}

function mapFuneral(f) {
  if (!f) return null;
  return {
    id: f.id, createdBy: f.created_by, deceasedName: f.deceased_name,
    dateOfBirth: f.date_of_birth, dateOfDeath: f.date_of_death,
    biography: f.biography, photo: f.photo, galleryPhotos: f.gallery_photos,
    funeralDate: f.funeral_date, funeralTime: f.funeral_time,
    venue: f.venue, livestreamUrl: f.livestream_url,
    burialSite: f.burial_site, officiant: f.officiant, mortuary: f.mortuary,
    fundraisingGoal: Number(f.fundraising_goal), raised: Number(f.raised),
    privacy: f.privacy, notifyMsg: f.notify_msg, status: f.status,
    tier: f.tier, premiumExpiresAt: f.premium_expires_at,
    orderOfService: f.order_of_service,
    createdAt: f.created_at, updatedAt: f.updated_at,
    contributorsCount: f.contributors_count,
  };
}

// ── Migrate stale localStorage user (pre-role fix) ──────────
(function migrateUser() {
  try {
    const raw = localStorage.getItem('faraja_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (!u.role && u.role_name) {
        u.role = u.role_name;
        localStorage.setItem('faraja_user', JSON.stringify(u));
      }
    }
  } catch (_) { /* ignore */ }
})();

const FarajaAPI = {
  // ── Auth ──
  login: async (email, password) => {
    try {
      const res = await apiRequest('/auth/login', { method: 'POST', body: { email, password }, auth: false });
      localStorage.setItem('faraja_token', res.data.token);
      localStorage.setItem('faraja_user', JSON.stringify(res.data.user));
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  register: async (data) => {
    // data: { name, email, phone, password, role }
    try {
      const res = await apiRequest('/auth/register', { method: 'POST', body: data, auth: false });
      localStorage.setItem('faraja_token', res.data.token);
      localStorage.setItem('faraja_user', JSON.stringify(res.data.user));
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  forgotPassword: async (email) => {
    try {
      await apiRequest('/auth/forgot-password', { method: 'POST', body: { email }, auth: false });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  logout: () => {
    localStorage.removeItem('faraja_token');
    localStorage.removeItem('faraja_user');
    ActiveFuneral.clear();
    window.location.href = 'login.html';
  },

  currentUser: () => {
    try { return JSON.parse(localStorage.getItem('faraja_user')); } catch { return null; }
  },

  // ── User profile ──
  getProfile: async () => {
    const res = await apiRequest('/users/profile');
    return res.data.user;
  },

  getMyContributions: async () => {
    const res = await apiRequest('/users/profile/contributions');
    return res.data.contributions;
  },

  updateProfile: async (data) => {
    // data: { name, phone, currentPassword, newPassword } — plain object (no photo)
    try {
      const res = await apiRequest('/users/profile', { method: 'PUT', body: data });
      return { success: true, ...res.data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  updateProfileWithPhoto: async (formData) => {
    // formData: FormData including a 'profilePhoto' file field
    try {
      const res = await apiRequest('/users/profile', { method: 'PUT', body: formData, isFormData: true });
      return { success: true, ...res.data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ── Funerals ──
  getFunerals: async () => {
    try {
      const res = await apiRequest('/funerals');
      return (res.data.funerals || []).map(mapFuneral);
    } catch {
      return (JSON.parse(localStorage.getItem('faraja_funerals') || '[]')).map(mapFuneral);
    }
  },

  getActiveFunerals: async () => {
    const hasToken = !!FarajaAPI.currentUser();
    const res = await apiRequest('/funerals/public/active', { auth: hasToken });
    return res.data.funerals;
  },

  getFuneral: async (funeralId) => {
    const res = await apiRequest(`/funerals/${funeralId}`);
    return res.data.funeral;
  },

  saveFuneral: async (data) => {
    // data: { deceasedName, dateOfBirth, dateOfDeath, biography, funeralDate, funeralTime,
    //          venue, burialSite, officiant, mortuary, fundraisingGoal, privacy, notifyMsg,
    //          committee: [{name,phone,role}], photoFile }
    try {
      const form = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (key === 'photoFile' && val) form.append('photo', val);
        else if (key === 'committee') form.append('committee', JSON.stringify(val || []));
        else if (val !== undefined && val !== null) form.append(key, val);
      });
      const res = await apiRequest('/funerals', { method: 'POST', body: form, isFormData: true });
      return { success: true, funeral: res.data.funeral };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  updateFuneral: async (funeralId, data) => {
    // data: { deceasedName, dateOfBirth, dateOfDeath, biography, funeralDate,
    //         funeralTime, venue, burialSite, officiant, mortuary,
    //         fundraisingGoal, privacy, notifyMsg, orderOfService, status }
    try {
      const form = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (key === 'photoFile' && val) form.append('photo', val);
        else if (val !== undefined && val !== null) form.append(key, val);
      });
      const res = await apiRequest(`/funerals/${funeralId}`, { method: 'PUT', body: form, isFormData: true });
      return { success: true, funeral: res.data.funeral };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  getDashboard: async (funeralId) => {
    const res = await apiRequest(`/funerals/${funeralId}/dashboard`);
    return res.data;
  },

  // ── Committee ──
  getCommittee: async (funeralId) => {
    const res = await apiRequest(`/funerals/${funeralId}/committee`);
    return res.data.members;
  },

  addCommitteeMember: async (funeralId, data) => {
    // data: { name, phone, email, location, role }
    try {
      const res = await apiRequest(`/funerals/${funeralId}/committee`, { method: 'POST', body: data });
      return { success: true, member: res.data.member };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  updateCommitteeMember: async (funeralId, memberId, data) => {
    try {
      const res = await apiRequest(`/funerals/${funeralId}/committee/${memberId}`, { method: 'PUT', body: data });
      return { success: true, ...res.data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ── Contributions / Donations ──
  getContributions: async (funeralId) => {
    const path = funeralId ? `/donations/${funeralId}` : '/donations';
    const res = await apiRequest(path);
    return res.data.contributions;
  },

  saveContribution: async (data) => {
    // data: { funeralId, amount, phone, donorName, paymentMethod, message, isAnonymous }
    try {
      const res = await apiRequest('/donations', { method: 'POST', body: data, auth: false });
      return { success: true, message: res.message, ...res.data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ── Tasks ──
  getTasks: async (funeralId) => {
    const res = await apiRequest(`/funerals/${funeralId}/tasks`);
    return res.data.tasks;
  },

  saveTask: async (funeralId, data) => {
    // data: { title, description, assignedTo, priority, status, dueDate }
    try {
      const res = await apiRequest(`/funerals/${funeralId}/tasks`, { method: 'POST', body: data });
      return { success: true, task: res.data.task };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  updateTask: async (taskId, data) => {
    try {
      const res = await apiRequest(`/tasks/${taskId}`, { method: 'PUT', body: data });
      return { success: true, ...res.data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  completeTask: async (taskId) => {
    try {
      const res = await apiRequest(`/tasks/${taskId}/complete`, { method: 'PATCH' });
      return { success: true, ...res.data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  deleteTask: async (taskId) => {
    try {
      await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ── Expenses ──
  getExpenses: async (funeralId) => {
    const res = await apiRequest(`/funerals/${funeralId}/expenses`);
    return res.data; // { expenses, total, paid, pending }
  },

  saveExpense: async (funeralId, data) => {
    // data: { description, category, amount, paidBy, expenseDate, status, notes }
    try {
      const res = await apiRequest(`/funerals/${funeralId}/expenses`, { method: 'POST', body: data });
      return { success: true, expense: res.data.expense };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  updateExpense: async (expenseId, data) => {
    try {
      const res = await apiRequest(`/expenses/${expenseId}`, { method: 'PUT', body: data });
      return { success: true, ...res.data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  deleteExpense: async (expenseId) => {
    try {
      await apiRequest(`/expenses/${expenseId}`, { method: 'DELETE' });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ── M-PESA STK Push ──
  // Routed through the same /donations endpoint the backend uses for
  // every payment method; the backend's mpesa.js util triggers the
  // real Safaricom Daraja STK push when paymentMethod is 'mpesa'.
  mpesaSTKPush: async ({ phone, amount, funeralId }) => {
    try {
      const res = await apiRequest('/donations', {
        method: 'POST',
        body: { funeralId, amount, phone, paymentMethod: 'mpesa' },
        auth: false,
      });
      return { success: true, checkoutRequestID: res.data.checkoutRequestID, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ── Role-aware redirect ──────────────────────────────────────
  redirectByRole: (user) => {
    if (!user) { window.location.href = 'login.html'; return; }
    const role = user.role || user.role_name;
    switch (role) {
      case 'admin':  window.location.href = 'admin-dashboard.html';  break;
      case 'vendor': window.location.href = 'vendor-dashboard.html'; break;
      default:       window.location.href = 'funeral-dashboard.html';
    }
  },

  // ── Vendors (API + localStorage fallback for test mode) ─────
  getVendors: async () => {
    try {
      const res = await apiRequest('/vendors');
      return (res.data.vendors || []).map(mapVendor);
    } catch {
      return JSON.parse(localStorage.getItem('faraja_vendors') || '[]');
    }
  },
  getActiveVendors: async () => {
    try {
      const res = await apiRequest('/vendors/active', { auth: false });
      return (res.data.vendors || []).map(mapVendor);
    } catch {
      const all = JSON.parse(localStorage.getItem('faraja_vendors') || '[]');
      return all.filter(v => v.status !== 'suspended');
    }
  },
  getVendorByUserId: async (userId) => {
    try {
      const res = await apiRequest('/vendors/me');
      return mapVendor(res.data.vendor);
    } catch {
      const vendors = JSON.parse(localStorage.getItem('faraja_vendors') || '[]');
      return vendors.find(v => v.userId === userId) || null;
    }
  },
  getVendorById: async (id) => {
    try {
      const res = await apiRequest(`/vendors/${id}`);
      return mapVendor(res.data.vendor);
    } catch {
      const vendors = JSON.parse(localStorage.getItem('faraja_vendors') || '[]');
      return vendors.find(v => v.id === id) || null;
    }
  },
  updateVendor: async (id, updates) => {
    try {
      const body = {};
      if (updates.businessName !== undefined) body.businessName = updates.businessName;
      if (updates.category !== undefined)     body.category = updates.category;
      if (updates.location !== undefined)     body.location = updates.location;
      if (updates.phone !== undefined)        body.phone = updates.phone;
      if (updates.email !== undefined)        body.email = updates.email;
      if (updates.description !== undefined)  body.description = updates.description;
      if (updates.status !== undefined)       body.status = updates.status;
      if (updates.verified !== undefined)     body.verified = updates.verified;
      const res = await apiRequest(`/vendors/${id}`, { method: 'PUT', body });
      return { success: true, vendor: mapVendor(res.data.vendor) };
    } catch {
      const vendors = JSON.parse(localStorage.getItem('faraja_vendors') || '[]');
      const idx = vendors.findIndex(v => v.id === id);
      if (idx === -1) return { success: false, message: 'Vendor not found' };
      vendors[idx] = { ...vendors[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('faraja_vendors', JSON.stringify(vendors));
      return { success: true, vendor: vendors[idx] };
    }
  },
  deleteVendor: async (id) => {
    try {
      await apiRequest(`/vendors/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch {
      let vendors = JSON.parse(localStorage.getItem('faraja_vendors') || '[]');
      vendors = vendors.filter(v => v.id !== id);
      localStorage.setItem('faraja_vendors', JSON.stringify(vendors));
      let products = JSON.parse(localStorage.getItem('faraja_products') || '[]');
      products = products.filter(p => p.vendorId !== id);
      localStorage.setItem('faraja_products', JSON.stringify(products));
      return { success: true };
    }
  },
  approveVendor: async (id, status) => {
    const verified = status === 'active' ? 1 : 0;
    return FarajaAPI.updateVendor(id, { status, verified });
  },

  // ── Products (API + localStorage fallback) ──────────────────
  getProducts: async (vendorId) => {
    try {
      let path, opts;
      if (vendorId) {
        path = `/vendors/${vendorId}/products`;
        opts = { auth: true };
      } else if (localStorage.getItem('faraja_token')) {
        path = '/products';
        opts = { auth: true };
      } else {
        path = '/products/active';
        opts = { auth: false };
      }
      const res = await apiRequest(path, opts);
      return (res.data.products || []).map(mapProduct);
    } catch {
      const all = JSON.parse(localStorage.getItem('faraja_products') || '[]');
      return vendorId ? all.filter(p => p.vendorId === vendorId) : all;
    }
  },
  saveProduct: async (data) => {
    try {
      if (!data.vendorId) return { success: false, message: 'Vendor ID is required' };
      const body = {
        name: data.name, category: data.category, price: data.price,
        stock: data.stock, description: data.description,
        imageUrl: data.imageUrl, status: data.status,
        vendorId: data.vendorId,
      };
      const res = await apiRequest(`/vendors/${data.vendorId}/products`, { method: 'POST', body });
      return { success: true, product: mapProduct(res.data.product) };
    } catch {
      const products = JSON.parse(localStorage.getItem('faraja_products') || '[]');
      const product = { id: 'prod_' + Date.now(), ...data, createdAt: new Date().toISOString() };
      products.push(product);
      localStorage.setItem('faraja_products', JSON.stringify(products));
      return { success: true, product };
    }
  },
  updateProduct: async (id, updates) => {
    try {
      const vendorId = updates.vendorId;
      const body = {};
      if (updates.name !== undefined)        body.name = updates.name;
      if (updates.category !== undefined)    body.category = updates.category;
      if (updates.price !== undefined)       body.price = updates.price;
      if (updates.stock !== undefined)       body.stock = updates.stock;
      if (updates.description !== undefined) body.description = updates.description;
      if (updates.imageUrl !== undefined)    body.imageUrl = updates.imageUrl;
      if (updates.status !== undefined)      body.status = updates.status;
      const res = await apiRequest(`/vendors/${vendorId}/products/${id}`, { method: 'PUT', body });
      return { success: true, product: mapProduct(res.data.product) };
    } catch {
      const products = JSON.parse(localStorage.getItem('faraja_products') || '[]');
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) return { success: false, message: 'Product not found' };
      products[idx] = { ...products[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('faraja_products', JSON.stringify(products));
      return { success: true, product: products[idx] };
    }
  },
  deleteProduct: async (id) => {
    try {
      await apiRequest(`/products/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch {
      let products = JSON.parse(localStorage.getItem('faraja_products') || '[]');
      products = products.filter(p => p.id !== id);
      localStorage.setItem('faraja_products', JSON.stringify(products));
      return { success: true };
    }
  },

  // ── Bookings (vendor service requests) ─────────────────────
  createBooking: async (data) => {
    try {
      const res = await apiRequest('/bookings', { method: 'POST', body: data });
      return { success: true, booking: mapBooking(res.data.booking) };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },
  getFuneralBookings: async (funeralId) => {
    try {
      const res = await apiRequest(`/bookings/funeral/${funeralId}`);
      return (res.data.bookings || []).map(mapBooking);
    } catch {
      return [];
    }
  },
  getVendorBookings: async () => {
    try {
      const res = await apiRequest('/bookings/vendor');
      return (res.data.bookings || []).map(mapBooking);
    } catch {
      return [];
    }
  },
  getAllBookings: async () => {
    try {
      const res = await apiRequest('/bookings/admin');
      return { bookings: (res.data.bookings || []).map(mapBooking), summary: res.data.summary };
    } catch {
      return { bookings: [], summary: null };
    }
  },
  updateBookingStatus: async (id, status) => {
    try {
      const res = await apiRequest(`/bookings/${id}/status`, { method: 'PATCH', body: { status } });
      return { success: true, booking: mapBooking(res.data.booking) };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ── Reviews ───────────────────────────────────────────────
  getVendorReviews: async (vendorId) => {
    try {
      const res = await apiRequest(`/reviews/${vendorId}`, { auth: false });
      return { reviews: res.data.reviews || [], stats: res.data.stats };
    } catch { return { reviews: [], stats: { count: 0, avgRating: 0 } }; }
  },
  createReview: async (data) => {
    try {
      const res = await apiRequest('/reviews', { method: 'POST', body: data });
      return { success: true, review: res.data.review };
    } catch (err) { return { success: false, message: err.message }; }
  },
  deleteReview: async (id) => {
    try {
      await apiRequest(`/reviews/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  },

  // ── Condolences (guestbook) ──────────────────────────────
  getCondolences: async (funeralId) => {
    try {
      const res = await apiRequest(`/condolences/${funeralId}`, { auth: false });
      return { condolences: res.data.condolences, count: res.data.count };
    } catch { return { condolences: [], count: 0 }; }
  },
  saveCondolence: async (data) => {
    // data: { funeralId, name, email, message, relationship }
    try {
      const res = await apiRequest('/condolences', { method: 'POST', body: data, auth: false });
      return { success: true, condolence: res.data.condolence };
    } catch (err) { return { success: false, message: err.message }; }
  },
  deleteCondolence: async (id) => {
    try {
      await apiRequest(`/condolences/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  },

  // ── Public Memorial / Tribute ─────────────────────────────
  getPublicMemorial: async (id) => {
    try {
      const res = await apiRequest(`/funerals/${id}/public`, { auth: false });
      return res.data.memorial;
    } catch { return null; }
  },
  printMemorial: async (id) => {
    try {
      const res = await apiRequest(`/funerals/${id}/print`);
      return res.data;
    } catch { return null; }
  },
  upgradeTier: async (id, tier) => {
    try {
      const res = await apiRequest(`/funerals/${id}/upgrade`, { method: 'POST', body: { tier } });
      return { success: true, memorial: res.data.memorial };
    } catch (err) { return { success: false, message: err.message }; }
  },
  announceFuneral: async (id, message) => {
    try {
      const res = await apiRequest(`/funerals/${id}/announce`, { method: 'POST', body: { message } });
      return { success: true, shareText: res.data.shareText, ...res.data };
    } catch (err) { return { success: false, message: err.message }; }
  },

  // ── Admin Metrics ──────────────────────────────────────────
  getAdminMetrics: async () => {
    try {
      const res = await apiRequest('/users/admin/metrics');
      return res.data.metrics;
    } catch {
      return null;
    }
  },

  // ── Users CRUD (API + localStorage fallback) ───────────────
  getUsers: async () => {
    try {
      const res = await apiRequest('/users/all');
      return (res.data.users || []).map(mapAdminUser);
    } catch {
      return JSON.parse(localStorage.getItem('faraja_users') || '[]');
    }
  },
  updateUser: async (id, updates) => {
    try {
      const res = await apiRequest(`/users/${id}`, { method: 'PUT', body: updates });
      return { success: true, user: mapAdminUser(res.data.user) };
    } catch {
      const users = JSON.parse(localStorage.getItem('faraja_users') || '[]');
      const idx = users.findIndex(u => u.id === id);
      if (idx === -1) return { success: false };
      users[idx] = { ...users[idx], ...updates };
      localStorage.setItem('faraja_users', JSON.stringify(users));
      return { success: true, user: users[idx] };
    }
  },
  deleteUser: async (id) => {
    try {
      await apiRequest(`/users/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch {
      let users = JSON.parse(localStorage.getItem('faraja_users') || '[]');
      users = users.filter(u => u.id !== id);
      localStorage.setItem('faraja_users', JSON.stringify(users));
      return { success: true };
    }
  },

  // ── Funerals CRUD (API + localStorage fallback) ────────────
  deleteFuneral: async (id) => {
    try {
      await apiRequest(`/funerals/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch {
      let funerals = JSON.parse(localStorage.getItem('faraja_funerals') || '[]');
      funerals = funerals.filter(f => f.id !== id);
      localStorage.setItem('faraja_funerals', JSON.stringify(funerals));
      return { success: true };
    }
  },
};

// ─── Test Mode ──────────────────────────────────────────────
const TestMode = {
  key: 'faraja_test_mode',
  isOn: () => localStorage.getItem(TestMode.key) !== 'off',
  setOn: () => { localStorage.setItem(TestMode.key, 'on'); TestMode.render(); },
  setOff: () => { localStorage.setItem(TestMode.key, 'off'); TestMode.render(); },
  toggle: () => { TestMode.isOn() ? TestMode.setOff() : TestMode.setOn(); },
  render: () => {
    let btn = document.getElementById('testModeBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'testModeBtn';
      btn.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:9999;border:none;border-radius:20px;padding:8px 16px;font-size:0.75rem;font-weight:700;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,0.25);transition:all 0.2s ease;display:flex;align-items:center;gap:6px;';
      btn.onclick = TestMode.toggle;
      document.body.appendChild(btn);
    }
    const on = TestMode.isOn();
    if (on) {
      btn.style.background = 'var(--info)';
      btn.style.color = '#fff';
      btn.innerHTML = '<span>🔬</span> Test Mode';
    } else {
      btn.style.background = 'var(--surface)';
      btn.style.color = 'var(--text-secondary)';
      btn.style.border = '1px solid var(--border-light)';
      btn.innerHTML = '<span>💳</span> Live';
    }
  },
};

// ─── Utility helpers ──────────────────────────────────────────
const Utils = {
  formatCurrency: (n, currency = 'KES') => `${currency} ${Number(n).toLocaleString('en-KE')}`,
  formatDate: (d) => new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }),
  formatDateTime: (d) => new Date(d).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
  daysUntil: (d) => Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000)),
  initials: (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?',
  slugify: (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  debounce: (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; },
  setButtonLoading: (btn, loading) => {
    if (loading) { btn.dataset.origText = btn.innerHTML; btn.classList.add('btn-loading'); btn.disabled = true; btn.innerHTML = ''; }
    else { btn.classList.remove('btn-loading'); btn.disabled = false; btn.innerHTML = btn.dataset.origText || 'Submit'; }
  },
  getParam: (key) => new URLSearchParams(window.location.search).get(key),
  redirectTo: (url) => window.location.href = url,
};

// ─── Auth guard ───────────────────────────────────────────────
function requireAuth() {
  const user = FarajaAPI.currentUser();
  if (!user) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
    return false;
  }
  return user;
}

// ─── Populate user info in sidebar / navbar ───────────────────
function populateUserInfo() {
  const user = FarajaAPI.currentUser();
  if (!user) return;
  document.querySelectorAll('.user-name').forEach(el => el.textContent = user.name);
  const role = user.role || user.role_name;
  document.querySelectorAll('.user-role').forEach(el => el.textContent = role || 'Family Member');
  document.querySelectorAll('.user-email').forEach(el => el.textContent = user.email);
  document.querySelectorAll('.user-avatar-initials').forEach(el => el.textContent = Utils.initials(user.name));

}
populateUserInfo();

// ─── Intersect animation ──────────────────────────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  io.observe(el);
});

// ─── Expose globals ───────────────────────────────────────────
window.FarajaAPI = FarajaAPI;
window.ActiveFuneral = ActiveFuneral;
window.TestMode = TestMode;
window.Utils = Utils;
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.validators = validators;
window.validateField = validateField;
window.setFieldError = setFieldError;
window.setFieldSuccess = setFieldSuccess;
window.clearFieldState = clearFieldState;
window.setupPasswordStrength = setupPasswordStrength;
window.setupFileUpload = setupFileUpload;
window.requireAuth = requireAuth;
window.populateUserInfo = populateUserInfo;

// ─── Render test mode bar on every page ──────────────────────
TestMode.render();
