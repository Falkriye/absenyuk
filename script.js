// Prototype interaktif Absen PAUD. Animasi memakai anime.js v3 (dimuat dari CDN di index.html).
// Semua data di bawah hanya contoh. Di aplikasi asli data berasal dari database.

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dur = (ms) => (reduce ? 0 : ms);
const $ = (id) => document.getElementById(id);

const ST = ['Hadir', 'Izin', 'Sakit', 'Alpa'];
const CLS = ['hadir', 'izin', 'sakit', 'alpa'];
const NAMES = ['Aisyah', 'Bima', 'Citra', 'Dafa', 'Eka'];

const state = { role: 'guru', tab: 0, sts: [0, 0, 2, 0, 1], checked: false, saved: false, sent: false };

const SCREENS = { guru: ['g-absen', 'g-materi'], ortu: ['o-beranda', 'o-riwayat'], admin: ['a-rekap', 'a-data'] };
const TABS = { guru: ['Absen', 'Materi'], ortu: ['Beranda', 'Riwayat'], admin: ['Rekap', 'Data'] };
const HEAD = {
  guru: ['Bu Rina, Kelas TK A', ['Absen hari ini', 'Materi hari ini']],
  ortu: ['Orang tua Aisyah', ['Beranda', 'Riwayat kehadiran']],
  admin: ['Admin PAUD', ['Rekap', 'Data sekolah']],
};
const STATS_O = [['18', 'Hadir'], ['1', 'Izin'], ['1', 'Sakit'], ['0', 'Alpa']];
const STATS_A = [['92%', 'Kehadiran anak'], ['5/5', 'Guru hadir']];
const HIST = [['Sel, 10 Nov', 0], ['Sen, 9 Nov', 0], ['Jum, 6 Nov', 2], ['Kam, 5 Nov', 0], ['Rab, 4 Nov', 1]];
const KELAS = [['KB', 88], ['TK A', 94], ['TK B', 90]];

const pillClass = (i) => 'pill pill--' + CLS[i];
const statHtml = (s) => `<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`;

// ---------- animasi ----------
function pop(el) {
  anime({ targets: el, scale: [1, 1.15, 1], duration: dur(240), easing: 'easeOutQuad' });
}
function reveal(el) {
  el.hidden = false;
  anime({ targets: el, opacity: [0, 1], translateY: [6, 0], duration: dur(260), easing: 'easeOutQuad' });
}
function animateIn(id) {
  const items = $(id).querySelectorAll('.card, .kids li, .hist li, .stat, .bars li, .btn');
  anime({ targets: items, opacity: [0, 1], translateY: [10, 0], delay: anime.stagger(45), duration: dur(320), easing: 'easeOutCubic' });
  if (id === 'a-rekap') {
    anime({
      targets: '.bars i',
      width: (el) => el.dataset.w + '%',
      delay: anime.stagger(90, { start: 200 }),
      duration: dur(700),
      easing: 'easeOutQuart',
    });
  }
}

// ---------- render per layar ----------
function renderSummary() {
  $('summary').textContent = ST.map((s, k) => `${s} ${state.sts.filter((v) => v === k).length}`).join(', ');
}
function renderKids() {
  $('kids').innerHTML = NAMES.map((n, i) =>
    `<li><span class="avatar">${n[0]}</span><span class="name">${n}</span>` +
    `<button type="button" class="${pillClass(state.sts[i])}" data-i="${i}">${ST[state.sts[i]]}</button></li>`
  ).join('');
  renderSummary();
}
function renderBeranda() {
  $('abs-title').textContent = state.saved ? `Aisyah ${ST[state.sts[0]].toLowerCase()} hari ini` : 'Menunggu absen hari ini';
  $('abs-sub').textContent = state.saved ? 'Dicatat oleh Bu Rina' : 'Notifikasi muncul setelah guru menyimpan absen';
  $('materi-cards').hidden = !state.sent;
  $('no-materi').hidden = state.sent;
}
function renderRiwayat() {
  $('stats-o').innerHTML = STATS_O.map(statHtml).join('');
  $('hist').innerHTML = HIST.map((h) => `<li><span>${h[0]}</span><span class="${pillClass(h[1])}">${ST[h[1]]}</span></li>`).join('');
}
function renderRekap() {
  $('stats-a').innerHTML = STATS_A.map(statHtml).join('');
  $('bars').innerHTML = KELAS.map((k) =>
    `<li><div class="bar-head"><span>${k[0]}</span><span>${k[1]}%</span></div><div class="bar"><i data-w="${k[1]}"></i></div></li>`
  ).join('');
}

function go() {
  const id = SCREENS[state.role][state.tab];
  document.querySelectorAll('.screen').forEach((s) => (s.hidden = s.id !== id));
  $('sub').textContent = HEAD[state.role][0];
  $('title').textContent = HEAD[state.role][1][state.tab];
  document.querySelectorAll('#roles button').forEach((b) => b.classList.toggle('is-on', b.dataset.role === state.role));
  $('tabs').innerHTML = TABS[state.role].map((t, i) =>
    `<button type="button" data-tab="${i}" class="${i === state.tab ? 'is-on' : ''}">${t}</button>`).join('');

  if (id === 'g-absen') renderKids();
  if (id === 'o-beranda') renderBeranda();
  if (id === 'o-riwayat') renderRiwayat();
  if (id === 'a-rekap') renderRekap();
  animateIn(id);
}

// ---------- interaksi ----------
$('roles').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  state.role = b.dataset.role;
  state.tab = 0;
  go();
});
$('tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  state.tab = +b.dataset.tab;
  go();
});
$('kids').addEventListener('click', (e) => {
  const b = e.target.closest('.pill');
  if (!b) return;
  const i = +b.dataset.i;
  state.sts[i] = (state.sts[i] + 1) % 4;
  state.saved = false;
  b.className = pillClass(state.sts[i]);
  b.textContent = ST[state.sts[i]];
  $('note-save').hidden = true;
  renderSummary();
  pop(b);
});
$('btn-checkin').addEventListener('click', (e) => {
  const b = e.currentTarget;
  state.checked = true;
  b.textContent = 'Sudah';
  b.disabled = true;
  $('check-text').textContent = 'Masuk 07:12, di area sekolah';
  pop(b);
});
$('btn-save').addEventListener('click', () => {
  state.saved = true;
  pop($('btn-save'));
  reveal($('note-save'));
});
$('btn-send').addEventListener('click', () => {
  state.sent = true;
  pop($('btn-send'));
  reveal($('note-send'));
});

go();
