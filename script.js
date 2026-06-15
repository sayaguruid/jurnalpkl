const API_URL = 'https://script.google.com/macros/s/AKfycbysxppH_OMJdAjxFaukWrBnjZE7D76jWncJa1R6ep12pH3lfV_KKFEK2RAalXOEEJW8tA/exec'; // GANTI INI
let currentUser = null;

// NAVIGASI TAB
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// ELEMEN DOM
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const loginForm = document.getElementById('login-form');
const nisInput = document.getElementById('nis-input');
const loginError = document.getElementById('login-error');

// Cek sesi
window.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('pklUser');
    if (user) {
        currentUser = JSON.parse(user);
        showDashboard();
    }
});

// LOGIN
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nis = nisInput.value.trim();
    loginError.textContent = "Proses login...";
    try {
        const res = await fetch(`${API_URL}?action=login&nis=${nis}`);
        const result = await res.json();
        if (result.status === 'success') {
            currentUser = { nis: nis, data: result.data };
            localStorage.setItem('pklUser', JSON.stringify(currentUser));
            showDashboard();
        } else {
            loginError.textContent = "NIS tidak ditemukan!";
        }
    } catch (error) {
        loginError.textContent = "Gagal terhubung ke server!";
    }
});

function showDashboard() {
    loginPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');
    document.getElementById('user-name').textContent = `Halo, ${currentUser.data[1] || 'Siswa'}`;
    populateProfileForm();
    loadJurnal();
    loadDokumentasi();
}

// ISI FORM PROFIL DARI DATABASE
function populateProfileForm() {
    const d = currentUser.data;
    document.getElementById('p-nama').value = d[1] || '';
    document.getElementById('p-nis').value = d[0] || '';
    document.getElementById('p-kelas').value = d[2] || '';
    document.getElementById('p-ttl').value = d[3] || '';
    document.getElementById('p-golDar').value = d[4] || '';
    document.getElementById('p-alamatSiswa').value = d[5] || '';
    document.getElementById('p-noHpSiswa').value = d[6] || '';
    document.getElementById('p-namaOrtu').value = d[7] || '';
    document.getElementById('p-alamatOrtu').value = d[8] || '';
    document.getElementById('p-noHpOrtu').value = d[9] || '';
    document.getElementById('p-namaDUDIKA').value = d[10] || '';
    document.getElementById('p-bidangUsaha').value = d[11] || '';
    document.getElementById('p-alamatDUDIKA').value = d[12] || '';
    document.getElementById('p-telpDUDIKA').value = d[13] || '';
    document.getElementById('p-pimpinanDUDIKA').value = d[14] || '';
    document.getElementById('p-pembimbingDUDIKA').value = d[15] || '';
    document.getElementById('p-instruktur').value = d[16] || '';
    document.getElementById('p-guruPembimbing').value = d[17] || '';
}

// SIMPAN PROFIL
document.getElementById('profil-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('profil-msg');
    msg.textContent = "Menyimpan...";
    const data = {
        action: 'saveProfile', nis: currentUser.nis,
        nama: document.getElementById('p-nama').value, kelas: document.getElementById('p-kelas').value,
        ttl: document.getElementById('p-ttl').value, golDar: document.getElementById('p-golDar').value,
        alamatSiswa: document.getElementById('p-alamatSiswa').value, noHpSiswa: document.getElementById('p-noHpSiswa').value,
        namaOrtu: document.getElementById('p-namaOrtu').value, alamatOrtu: document.getElementById('p-alamatOrtu').value,
        noHpOrtu: document.getElementById('p-noHpOrtu').value, namaDUDIKA: document.getElementById('p-namaDUDIKA').value,
        bidangUsaha: document.getElementById('p-bidangUsaha').value, alamatDUDIKA: document.getElementById('p-alamatDUDIKA').value,
        telpDUDIKA: document.getElementById('p-telpDUDIKA').value, pimpinanDUDIKA: document.getElementById('p-pimpinanDUDIKA').value,
        pembimbingDUDIKA: document.getElementById('p-pembimbingDUDIKA').value, instruktur: document.getElementById('p-instruktur').value,
        guruPembimbing: document.getElementById('p-guruPembimbing').value
    };
    try {
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(data) });
        const result = await res.json();
        msg.style.color = 'green'; msg.textContent = "Berhasil disimpan!";
    } catch (error) { msg.style.color = 'red'; msg.textContent = "Gagal menyimpan!"; }
});

// JURNAL HARIAN
document.getElementById('jurnal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('jurnal-msg');
    msg.textContent = "Menyimpan...";
    const data = {
        action: 'saveJurnal', nis: currentUser.nis,
        tanggal: document.getElementById('j-tanggal').value,
        unitKerja: document.getElementById('j-unit').value,
        catatan: document.getElementById('j-catatan').value,
        kehadiran: document.getElementById('j-kehadiran').value
    };
    try {
        await fetch(API_URL, { method: 'POST', body: JSON.stringify(data) });
        msg.style.color = 'green'; msg.textContent = "Berhasil disimpan!";
        document.getElementById('jurnal-form').reset();
        loadJurnal();
    } catch (error) { msg.style.color = 'red'; msg.textContent = "Gagal!"; }
});

async function loadJurnal() {
    try {
        const res = await fetch(`${API_URL}?action=getJurnal&nis=${currentUser.nis}`);
        const jurnals = await res.json();
        const tbody = document.querySelector('#tabel-jurnal tbody');
        tbody.innerHTML = '';
        
        let hadir=0, izin=0, sakit=0, bolos=0;

        if (jurnals.length > 0) {
            jurnals.reverse().forEach(row => {
                const cls = `status status-${row.kehadiran.toLowerCase()}`;
tbody.innerHTML += `<tr><td>${row.tanggal}</td><td>${row.unitKerja}</td><td>${row.catatan}</td><td><span class="${cls}">${row.kehadiran}</span></td></tr>`;
                if(row.kehadiran === 'Hadir') hadir++;
                if(row.kehadiran === 'Izin') izin++;
                if(row.kehadiran === 'Sakit') sakit++;
                if(row.kehadiran === 'Bolos') bolos++;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Belum ada data</td></tr>';
        }
        
        // Update Rekap
        document.getElementById('r-hadir').textContent = hadir;
        document.getElementById('r-izin').textContent = izin;
        document.getElementById('r-sakit').textContent = sakit;
        document.getElementById('r-bolos').textContent = bolos;

    } catch (error) { console.error("Gagal memuat jurnal"); }
}

// CATATAN KEGIATAN
document.getElementById('catatan-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('catatan-msg');
    msg.textContent = "Menyimpan...";
    const data = {
        action: 'saveCatatan', nis: currentUser.nis,
        tanggal: document.getElementById('c-tanggal').value,
        namaPekerjaan: document.getElementById('c-namaPekerjaan').value,
        perencanaan: document.getElementById('c-perencanaan').value,
        pelaksanaan: document.getElementById('c-pelaksanaan').value,
        catatanInstruktur: document.getElementById('c-catatanInstruktur').value
    };
    try {
        await fetch(API_URL, { method: 'POST', body: JSON.stringify(data) });
        msg.style.color = 'green'; msg.textContent = "Berhasil disimpan!";
        document.getElementById('catatan-form').reset();
    } catch (error) { msg.style.color = 'red'; msg.textContent = "Gagal!"; }
});

// DOKUMENTASI UPLOAD BASE64
document.getElementById('dokumen-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('dokumen-msg');
    const file = document.getElementById('d-foto').files[0];
    if(!file) return;

    msg.textContent = "Compressing image...";
    const reader = new FileReader();
    reader.onload = async function(event) {
        const base64 = event.target.result;
        msg.textContent = "Uploading...";
        
        const data = {
            action: 'saveDokumentasi', nis: currentUser.nis,
            tanggal: document.getElementById('d-tanggal').value,
            keterangan: document.getElementById('d-keterangan').value,
            fileName: `PKL_${currentUser.nis}_${Date.now()}.jpg`,
            base64: base64
        };
        try {
            await fetch(API_URL, { method: 'POST', body: JSON.stringify(data) });
            msg.style.color = 'green'; msg.textContent = "Upload berhasil!";
            document.getElementById('dokumen-form').reset();
            loadDokumentasi();
        } catch (error) { msg.style.color = 'red'; msg.textContent = "Gagal Upload!"; }
    };
    reader.readAsDataURL(file);
});

async function loadDokumentasi() {
    try {
        const res = await fetch(`${API_URL}?action=getDokumentasi&nis=${currentUser.nis}`);
        const docs = await res.json();
        const galeri = document.getElementById('galeri-foto');
        galeri.innerHTML = '';
        
        if (docs.length > 0) {
            docs.reverse().forEach(row => {
                // Ubah URL Google Drive menjadi direct link jika perlu (Ini trik lama, tapi gasal URL langsung kadang error CORS)
                let imgSrc = row.url;
                if(imgSrc.includes("drive.google.com")) {
                    const fileId = imgSrc.split('/d/')[1]?.split('/')[0];
                    if(fileId) imgSrc = `https://drive.google.com/uc?export=view&id=${fileId}`;
                }

                galeri.innerHTML += `<div class="galeri-item"><img src="${imgSrc}" alt="Dokumentasi"><p>${row.keterangan}<br><small>${row.tanggal}</small></p></div>`;
            });
        } else {
            galeri.innerHTML = '<p>Belum ada dokumentasi.</p>';
        }
    } catch (error) { console.error("Gagal memuat dokumentasi"); }
}

// GENERATE PDF
function generatePDF() {
    const d = currentUser.data;
    const printArea = document.getElementById('print-area');
    
    // Isi Profil
    document.getElementById('pdf-profil').innerHTML = `
        <p><b>Nama:</b> ${d[1]} | <b>NIS:</b> ${d[0]} | <b>Kelas:</b> ${d[2]}</p>
        <p><b>Tempat PKL:</b> ${d[10]} | <b>Pembimbing:</b> ${d[15]}</p>
        <hr style="margin: 10px 0;">
    `;

    // Isi Tabel Jurnal
    const rows = document.querySelector('#tabel-jurnal tbody').innerHTML;
    document.getElementById('pdf-tabel-jurnal').innerHTML = rows;

    // Isi Rekap
    document.getElementById('pdf-rekap').innerHTML = `
        Hadir: ${document.getElementById('r-hadir').textContent} hari <br>
        Izin: ${document.getElementById('r-izin').textContent} hari <br>
        Sakit: ${document.getElementById('r-sakit').textContent} hari <br>
        Bolos: ${document.getElementById('r-bolos').textContent} hari
    `;

    // Print logic
    printArea.style.display = 'block';
    const opt = {
        margin:       10,
        filename:     `Jurnal_PKL_${d[1]}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(printArea).save().then(() => {
        printArea.style.display = 'none';
    });
}

// LOGOUT
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('pklUser');
    currentUser = null;
    dashboardPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
    nisInput.value = '';
    loginError.textContent = '';
});
