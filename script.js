// PASTE URL GOOGLE APPS SCRIPT ANDA DI SINI
const API_URL = 'https://script.google.com/macros/s/AKfycbw52QM624GMUxkJx_9LE6EnbDeeb9Z00JUREMuqk-LIbhyH_p3q2Bv0ZwM2X0LkwXW-/exec';

let currentUser = null;

// Elemen DOM
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const loginForm = document.getElementById('login-form');
const nisInput = document.getElementById('nis-input');
const loginError = document.getElementById('login-error');

const userName = document.getElementById('user-name');
const dNama = document.getElementById('d-nama');
const dNis = document.getElementById('d-nis');
const dKelas = document.getElementById('d-kelas');
const dPkl = document.getElementById('d-pkl');

const jurnalForm = document.getElementById('jurnal-form');
const jurnalMsg = document.getElementById('jurnal-msg');
const tableBody = document.getElementById('jurnal-table-body');
const logoutBtn = document.getElementById('logout-btn');

// Cek sesi saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('pklUser');
    if (user) {
        currentUser = JSON.parse(user);
        showDashboard();
    }
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nis = nisInput.value.trim();
    loginError.textContent = "Sedang mencari data...";

    try {
        const response = await fetch(`${API_URL}?data=${encodeURIComponent(JSON.stringify({ action: 'login', nis: nis }))}`);
        const result = await response.json();

        if (result.status === 'success') {
            currentUser = result;
            localStorage.setItem('pklUser', JSON.stringify(currentUser));
            showDashboard();
        } else {
            loginError.textContent = result.message;
        }
    } catch (error) {
        loginError.textContent = "Gagal terhubung ke server!";
    }
});

// Tampilkan Dashboard
function showDashboard() {
    loginPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');

    // Isi identitas
    userName.textContent = `Halo, ${currentUser.nama}`;
    dNama.textContent = currentUser.nama;
    dNis.textContent = currentUser.nis;
    dKelas.textContent = currentUser.kelas;
    dPkl.textContent = currentUser.tempatPKL;

    loadJurnal();
}

// Simpan Jurnal
jurnalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    jurnalMsg.textContent = "Menyimpan...";

    const data = {
        action: 'saveJurnal',
        nis: currentUser.nis,
        tanggal: document.getElementById('j-tanggal').value,
        unitKerja: document.getElementById('j-unit').value,
        catatan: document.getElementById('j-catatan').value,
        kehadiran: document.getElementById('j-kehadiran').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.status === 'success') {
            jurnalMsg.style.color = 'green';
            jurnalMsg.textContent = result.message;
            jurnalForm.reset();
            loadJurnal(); // Refresh tabel
        } else {
            jurnalMsg.style.color = 'red';
            jurnalMsg.textContent = result.message;
        }
    } catch (error) {
        jurnalMsg.style.color = 'red';
        jurnalMsg.textContent = "Gagal menyimpan jurnal!";
    }
});

// Load Riwayat Jurnal
async function loadJurnal() {
    try {
        const response = await fetch(`${API_URL}?data=${encodeURIComponent(JSON.stringify({ action: 'getJurnal', nis: currentUser.nis }))}`);
        const result = await response.json();

        tableBody.innerHTML = '';
        if (result.status === 'success' && result.data.length > 0) {
            result.data.reverse().forEach(row => {
                const tr = document.createElement('tr');
                const statusClass = `status-${row.kehadiran.toLowerCase()}`;
                tr.innerHTML = `
                    <td>${row.tanggal}</td>
                    <td>${row.unitKerja}</td>
                    <td>${row.catatan}</td>
                    <td class="${statusClass}">${row.kehadiran}</td>
                `;
                tableBody.appendChild(tr);
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Belum ada catatan jurnal.</td></tr>';
        }
    } catch (error) {
        console.error("Gagal memuat jurnal");
    }
}

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('pklUser');
    currentUser = null;
    dashboardPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
    nisInput.value = '';
    loginError.textContent = '';
});
