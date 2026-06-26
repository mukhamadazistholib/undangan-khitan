// ===== CONFIG =====
let DATA = {};
let currentSlide = 0;
let totalSlides = 8;
let autoPlay = false;
let autoPlayTimer = null;
let musicPlaying = false;
let rsvpAttendance = '';
let countdownTimer = null;
let protocolRemoved = false;

// NAV DEFINITION — matches slide indices
const NAV_ITEMS = [
  { id: 0, label: 'Opening', icon: 'home' },
  { id: 1, label: 'Profil', icon: 'user' },
  { id: 2, label: 'Event', icon: 'calendar' },
  { id: 3, label: 'Maps', icon: 'map-pin' },
  { id: 4, label: 'RSVP', icon: 'message' },
  { id: 5, label: 'Gift', icon: 'gift' },
  { id: 6, label: 'Gallery', icon: 'image' },
  { id: 7, label: 'Protokol', icon: 'shield' },
  { id: 8, label: 'Thanks', icon: 'heart' },
];

// We show max 5 nav items centered on current slide
function getVisibleNav(active) {
  // Map cover lock as "Opening" = index -1 (not in slides), slides 0-7
  let allItems = [
    { sid: -1, label: 'Opening', icon: 'home' },
    { sid: 0, label: 'Profil', icon: 'user' },
    { sid: 1, label: 'Event', icon: 'calendar' },
    { sid: 2, label: 'Maps', icon: 'map-pin' },
    { sid: 3, label: 'RSVP', icon: 'message' },
    { sid: 4, label: 'Gift', icon: 'gift' },
    { sid: 5, label: 'Gallery', icon: 'image' },
    { sid: 6, label: 'Protokol', icon: 'shield' },
    { sid: 7, label: 'Thanks', icon: 'heart' },
  ];

  if (DATA.protocol?.show === false) {
    // Filter protokol when false
    allItems = allItems.filter((item) => item.label !== 'Protokol');
    // Remapping sid Thanks from 7 → 6 when protokol is hidden, so nav still works
    allItems = allItems.map((item) =>
      item.label === 'Thanks' ? { ...item, sid: 6 } : item,
    );
  }
  // Find active index
  const activeIdx = allItems.findIndex((i) => i.sid === active);
  // Window of 5
  let start = Math.max(0, activeIdx - 2);
  let end = start + 5;
  if (end > allItems.length) {
    end = allItems.length;
    start = Math.max(0, end - 5);
  }
  return allItems.slice(start, end);
}

function navIcon(type) {
  const icons = {
    home: '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    user: '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    calendar:
      '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    'map-pin':
      '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    message:
      '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    gift: '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>',
    image:
      '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    shield:
      '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    heart:
      '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  };
  return icons[type] || icons['home'];
}

function renderNav(activeSid) {
  const nav = document.getElementById('bottom-nav');
  const items = getVisibleNav(activeSid);
  nav.innerHTML = items
    .map(
      (item) => `
    <div class="nav-item ${item.sid === activeSid ? 'active' : ''}" onclick="navTo(${item.sid})">
      ${navIcon(item.icon)}
      <span>${item.label}</span>
    </div>
  `,
    )
    .join('');
}

function navTo(sid) {
  if (sid === -1) {
    document.getElementById('cover-lock').classList.remove('opened');

    document
      .querySelectorAll('.slide')
      .forEach((slide) => slide.classList.remove('active'));

    currentSlide = -1;
    renderNav(-1);

    return;
  }

  goToSlide(sid);
}

// ===== SLIDE NAVIGATION =====
function goToSlide(idx) {
  if (idx < 0) idx = 0;
  if (idx >= totalSlides) idx = totalSlides - 1;

  // Skip slide if it's hidden (protokol slide when disabled)
  const slideEl = document.querySelectorAll('.slide')[idx];
  if (slideEl && slideEl.style.display === 'none') {
    // Determine direction to skip
    const direction = idx > currentSlide ? 1 : -1;
    idx += direction;
    if (idx < 0) idx = 0;
    if (idx >= totalSlides) idx = totalSlides - 1;
  }

  currentSlide = idx;
  const track = document.getElementById('slides-track');
  track.style.transform = `translateX(-${idx * 100}%)`;
  renderNav(idx);
  document.querySelectorAll('.slide').forEach((s, i) => {
    s.classList.remove('active');
    if (i === idx) setTimeout(() => s.classList.add('active'), 50);
  });
  updateFloatPlayIcon();
}

// Touch swipe
let touchStartX = 0;
document.getElementById('slides-wrapper').addEventListener(
  'touchstart',
  (e) => {
    touchStartX = e.touches[0].clientX;
  },
  { passive: true },
);
document.getElementById('slides-wrapper').addEventListener(
  'touchend',
  (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
    }
  },
  { passive: true },
);

// ===== COVER =====
function openInvitation() {
  const cover = document.getElementById('cover-lock');
  cover.classList.add('opened');
  goToSlide(0);
  // play music
  tryPlayMusic();
  setTimeout(() => {
    document.querySelectorAll('.slide')[0].classList.add('active');
  }, 900);
}

function backToCover() {
  const cover = document.getElementById('cover-lock');

  // sembunyikan semua slide
  document.querySelectorAll('.slide').forEach((slide) => {
    slide.classList.remove('active');
  });

  // tampilkan cover lagi
  cover.classList.remove('opened');

  // update navbar
  renderNav(-1);
}

// ===== MUSIC =====
function tryPlayMusic() {
  const music = document.getElementById('bg-music');
  music
    .play()
    .then(() => {
      musicPlaying = true;
      document.getElementById('music-btn').classList.add('playing');
      document.getElementById('music-btn').classList.remove('muted');
    })
    .catch(() => {
      musicPlaying = false;
    });
}

function toggleMusic() {
  const music = document.getElementById('bg-music');
  const btn = document.getElementById('music-btn');
  if (musicPlaying) {
    music.pause();
    musicPlaying = false;
    btn.classList.remove('playing');
    btn.classList.add('muted');
    btn.style.opacity = '0.6';
  } else {
    music.play();
    musicPlaying = true;
    btn.classList.add('playing');
    btn.classList.remove('muted');
    btn.style.opacity = '1';
  }
}

// ===== AUTO PLAY =====
function toggleAutoPlay() {
  autoPlay = !autoPlay;
  if (autoPlay) {
    autoPlayTimer = setInterval(() => {
      const next = (currentSlide + 1) % totalSlides;
      goToSlide(next);
    }, 4000);
  } else {
    clearInterval(autoPlayTimer);
  }
  updateFloatPlayIcon();
}

function updateFloatPlayIcon() {
  const icon = document.getElementById('play-icon');
  if (autoPlay) {
    icon.innerHTML =
      '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  } else {
    icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
  }
}

// ===== COUNTDOWN =====
function startCountdown(targetDateStr) {
  if (countdownTimer) clearInterval(countdownTimer);
  function update() {
    const now = new Date().getTime();
    const target = new Date(targetDateStr).getTime();
    const diff = target - now;
    if (diff <= 0) {
      [
        'cd-e-days',
        'cd-e-hours',
        'cd-e-minutes',
        'cd-e-seconds',
        'cd-r-days',
        'cd-r-hours',
        'cd-r-minutes',
        'cd-r-seconds',
      ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = '00';
      });
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const fmt = (n) => String(n).padStart(2, '0');
    const sets = [
      ['cd-e-days', 'cd-e-hours', 'cd-e-minutes', 'cd-e-seconds'],
      ['cd-r-days', 'cd-r-hours', 'cd-r-minutes', 'cd-r-seconds'],
    ];
    sets.forEach((ids) => {
      const els = ids.map((id) => document.getElementById(id));
      if (els[0]) els[0].textContent = fmt(days);
      if (els[1]) els[1].textContent = fmt(hours);
      if (els[2]) els[2].textContent = fmt(minutes);
      if (els[3]) els[3].textContent = fmt(seconds);
    });
  }
  update();
  countdownTimer = setInterval(update, 1000);
}

// ===== MODALS =====
function openModal(id) {
  document.getElementById(id).classList.add('show');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

function openQrModal() {
  openModal('qrModal');
  renderQR();
}
function openRsvpModal() {
  openModal('rsvpModal');
}

// Simple QR via canvas (basic QR placeholder with guest name)
function renderQR() {
  const canvas = document.getElementById('qr-canvas');
  const ctx = canvas.getContext('2d');
  // Draw a placeholder pattern (real QR would need a library)
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = '#1a1a1a';
  // finder patterns
  function drawFinder(x, y) {
    ctx.fillRect(x, y, 49, 49);
    ctx.fillStyle = 'white';
    ctx.fillRect(x + 7, y + 7, 35, 35);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 14, y + 14, 21, 21);
  }
  drawFinder(10, 10);
  drawFinder(141, 10);
  drawFinder(10, 141);
  // data area (random-ish pattern for visual)
  const seed = (DATA.guest || 'Tamu')
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if ((seed * (r + 1) * (c + 1)) % 3 === 0) {
        ctx.fillRect(80 + c * 7, 80 + r * 7, 6, 6);
      }
    }
  }
  ctx.fillStyle = '#1a1a1a';
  // timing patterns
  for (let i = 0; i < 8; i++) {
    if (i % 2 === 0) {
      ctx.fillRect(66 + i * 7, 10, 6, 6);
      ctx.fillRect(10, 66 + i * 7, 6, 6);
    }
  }
  document.getElementById('qr-guest-name').textContent =
    DATA.guest || 'Nama Tamu';
}

// ===== RSVP =====
function selectAttendance(val) {
  rsvpAttendance = val;
  document.getElementById('att-hadir').className =
    'attendance-option' + (val === 'hadir' ? ' selected-hadir' : '');
  document.getElementById('att-tidak').className =
    'attendance-option' + (val === 'tidak' ? ' selected-tidak' : '');
}

function submitRsvp() {
  const name = document.getElementById('rsvp-name').value.trim();
  const phone = document.getElementById('rsvp-phone').value.trim();
  const comment = document.getElementById('rsvp-comment').value.trim();
  if (!name) {
    showToast('Nama tidak boleh kosong');
    return;
  }
  if (!rsvpAttendance) {
    showToast('Pilih kehadiran terlebih dahulu');
    return;
  }
  // If webhook configured, send
  if (DATA.rsvpWebhook) {
    fetch(DATA.rsvpWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        attendance: rsvpAttendance,
        comment,
        guest: DATA.guest,
      }),
    }).catch(() => {});
  }
  document.getElementById('rsvp-form-container').style.display = 'none';
  document.getElementById('rsvp-success').style.display = 'block';
}

// ===== GIFT =====
function copyAccountNumber() {
  const num = DATA.gift?.accountNumber || '';
  navigator.clipboard
    .writeText(num)
    .then(() => {
      showToast('Nomor rekening disalin!', true);
    })
    .catch(() => {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = num;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Nomor rekening disalin!', true);
    });
}

// ===== LIGHTBOX =====
function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('show');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('show');
}

// ===== TOAST =====
function showToast(msg, success) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'show' + (success ? ' toast-copied' : '');
  setTimeout(() => (t.className = ''), 2500);
}

// ===== LOAD DATA =====
async function loadData() {
  try {
    const res = await fetch('data.json');
    DATA = await res.json();
  } catch (e) {
    // fallback defaults
    const DATA = {
      guest:
        new URLSearchParams(window.location.search).get('to') || 'Nama Tamu',
      event: {
        title: 'Tasyakuran Khitan',
        dateDisplay: 'Sabtu, 04 Juli 2026',
        timeDisplay: '13.00 WIB - 17.00 WIB',
        address:
          'Jl. Haji Sinen, No. 38B, RT/RW 07/07, Ragunan, Pasar Minggu, Jakarta Selatan, DKI Jakarta 12550',
        date: '2026-07-04T13:00:00',
        mapsEmbed:
          'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d485.79984527228316!2d106.82266958544648!3d-6.30148521593195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69edf3941dc385%3A0xcc0ec2e6547c53e3!2sAyam%20Geprek%20RFC!5e0!3m2!1sid!2sid!4v1782387828231!5m2!1sid!2sid',
        mapsLink:
          'https://www.google.com/maps/place/?q=-6.301689005226417,106.82267221401183',
      },
      child: {
        name: 'Arvino Xavier Faeyza',
        parentNames: 'Putra Bapak Ade & Ibu Ida',
        photo:
          'https://i.ibb.co.com/4R1wwFbH/Gemini-Generated-Image-x2nzypx2nzypx2nz.png',
      },
      gift: {
        bankName: 'BCA',
        accountHolder: 'Ade Hermawan',
        accountNumber: '5295041975',
        qrisImage: '',
      },
      gallery: [
        'https://i.ibb.co.com/xtwXSr1L/Gemini-Generated-Image-m2rv1qm2rv1qm2rv.png',
        'https://i.ibb.co.com/xtwXSr1L/Gemini-Generated-Image-m2rv1qm2rv1qm2rv.png',
        'https://i.ibb.co.com/xtwXSr1L/Gemini-Generated-Image-m2rv1qm2rv1qm2rv.png',
        'https://i.ibb.co.com/xtwXSr1L/Gemini-Generated-Image-m2rv1qm2rv1qm2rv.png',
      ],
      music: 'https://www.image2url.com/r2/default/audio/1782461975669-2db6e4c8-22a0-4615-9fdf-11792611a97a.mp3',
      greeting: {
        opening:
          "Assalamu\'alaikum Wr Wb\nTanpa mengurangi rasa hormat kami bermaksud mengundang Bapak/Ibu/Saudara/i pada acara syukuran khitan anak kami:",
        closing:
          "Merupakan suatu kebahagiaan dan kehormatan bagi kami, apabila teman-teman, berkenan hadir dan memberikan do\'a.",
        signature: 'Best regards',
      },
      protocol: {
        title: 'Health Protocol',
        description:
          'Mengingat kondisi pandemi saat ini, kami menghimbau Bapak/Ibu/Saudara/i tamu undangan agar tetap memperhatikan protokol kesehatan dalam rangka upaya pencegahan penyebaran virus Covid-19.',
        show: false,
      },
    };
  }

  // Override guest from URL param if present
  const params = new URLSearchParams(window.location.search);

  let urlGuest = params.get('to');

  // Fallback untuk URL aneh dari Live Preview
  if (!urlGuest && window.location.search.includes('to=')) {
    urlGuest = window.location.search.split('to=')[1];
  }

  if (urlGuest) {
    DATA.guest = decodeURIComponent(urlGuest).replace(/-/g, ' ').trim();
  }

  populate();
}

function populate() {
  const d = DATA;

  // Cover
  document.getElementById('cover-guest').textContent = d.guest || 'Nama Tamu';
  document.getElementById('cover-name').textContent = d.child?.name || '';
  document.getElementById('cover-event-title').textContent = (
    d.event?.title || 'TASYAKURAN KHITAN'
  ).toUpperCase();
  document.getElementById('cover-photo').src = d.child?.photo || '';

  // Profil
  document.getElementById('profile-photo').src = d.child?.photo || '';
  document.getElementById('profile-name').textContent = d.child?.name || '';
  document.getElementById('profile-parents').textContent =
    d.child?.parentNames || '';
  document.getElementById('profile-greeting').innerHTML = (
    d.greeting?.opening || ''
  ).replace(/\n/g, '<br>');

  // Event
  document.getElementById('event-title-slide').textContent = (
    d.event?.title || ''
  ).toUpperCase();
  document.getElementById('event-date-display').textContent =
    d.event?.dateDisplay || '';
  document.getElementById('event-time-display').textContent =
    d.event?.timeDisplay || '';
  document.getElementById('event-address-display').textContent =
    d.event?.address || '';

  // Maps
  document.getElementById('maps-address').textContent = d.event?.address || '';
  const mapsLink = document.getElementById('maps-link');
  mapsLink.href = d.event?.mapsLink || '#';
  // lazy load iframe when that slide is visible
  document.getElementById('map-iframe').src = d.event?.mapsEmbed || '';

  // RSVP
  document.getElementById('rsvp-desc').innerHTML =
    `Kirim ucapan untuk <br> <strong>${d.child?.name || ''}</strong><br>serta konfirmasi kehadiran`;

  // Gift
  document.getElementById('gift-account-number').textContent =
    d.gift?.accountNumber || '';
  document.getElementById('gift-bank-info').textContent =
    `${d.gift?.bankName || 'BCA'} : ${d.gift?.accountHolder || ''}`;
  if (d.gift?.qrisImage) {
    document.getElementById('gift-qr-img').src = d.gift.qrisImage;
  }

  // Gallery
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = (d.gallery || [])
    .map(
      (src) => `
    <div class="gallery-item" onclick="openLightbox('${src}')">
      <img src="${src}" alt="gallery" loading="lazy" />
    </div>
  `,
    )
    .join('');

  // Protocol
  document.getElementById('protocol-title').textContent =
    d.protocol?.title || 'Health Protocol';
  document.getElementById('protocol-desc').textContent =
    d.protocol?.description || '';

  // Thanks
  document.getElementById('thanks-closing').textContent =
    d.greeting?.closing || '';
  document.getElementById('thanks-signature').textContent =
    d.greeting?.signature || 'Best regards';
  document.getElementById('thanks-name').textContent = (
    d.child?.name || ''
  ).toUpperCase();

  // Music
  document.getElementById('music-src').src = d.music || '';
  document.getElementById('bg-music').load();

  // Countdown
  if (d.event?.date) startCountdown(d.event.date);

  // Protocol visibility
  if (d.protocol?.show === false) {
    const protocolSlide = document.querySelectorAll('.slide')[6];
    protocolSlide.remove();
    totalSlides = 7;
    protocolRemoved = true;
  }

  // Initial nav render (cover state)
  renderNav(-1);
}

// ===== INIT =====
loadData();

// Cover frame animations
setTimeout(() => {
  document.querySelectorAll('#cover-lock .anim-down').forEach((el) => {
    el.style.animation = 'fadeInDown 0.8s ease forwards';
  });
  document.querySelectorAll('#cover-lock .anim-up').forEach((el) => {
    el.style.animation = 'fadeInUp 0.8s ease 0.3s forwards';
  });
  document.querySelectorAll('#cover-lock .anim-zoom').forEach((el) => {
    el.style.animation = 'zoomIn 0.7s ease 0.1s forwards';
  });
}, 100);

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('show');
  });
});
