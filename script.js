// ==========================================
// KONFIGURASI
// ==========================================
// GANTI URL INI DENGAN URL DEPLOYMENT GOOGLE APPS SCRIPT ANDA
const API_URL = 'https://script.google.com/macros/s/AKfycbypoGiSXf6hlYPWX6RliXeNoXcNOCDD0O_j0j_VNISvDljJP44Udm4jUtC2WoZY5xGq/exec'; 

let currentUser = null;

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Set tanggal hari ini otomatis untuk semua input date
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(el => el.value = today);
});

// ==========================================
// LOGIN SYSTEM
// ==========================================
function handleLogin() {
  const nis = document.getElementById('nis').value.trim();
  const msg = document.getElementById('login-msg');
  
  if(!nis) {
    msg.innerText = "NIS tidak boleh kosong!";
    msg.className = 'msg error';
    return;
  }

  msg.innerText = "Mengecek data...";
  msg.className = 'msg';

  fetch(`${API_URL}?action=login&nis=${nis}`)
    .then(response => response.json())
    .then(res => {
      if(res.status === 'success') {
        currentUser = { nis: nis, data: res.data };
        
        // Tampilkan nama user
        document.getElementById('nama-siswa').innerText = res.data[1];
        document.getElementById('kelas-siswa').innerText = res.data[2];
        
        // Pindah halaman
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('dashboard-page').classList.remove('hidden');
        
        // Load data awal
        loadJurnal();
      } else {
        msg.innerText = res.message;
        msg.className = 'msg error';
      }
    })
    .catch(err => {
      console.error(err);
      msg.innerText = "Gagal terhubung ke server. Cek koneksi atau URL API.";
      msg.className = 'msg error';
    });
}

function handleLogout() {
  location.reload();
}

// ==========================================
// NAVIGATION
// ==========================================
function openTab(tabId) {
  // Update tombol aktif
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');
  
  // Hide semua tab
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  
  // Show tab yang dipilih
  document.getElementById('tab-' + tabId).classList.remove('hidden');

  // Load data tergantung tab
  if(tabId === 'jurnal') loadJurnal();
  if(tabId === 'catatan') loadCatatan();
  if(tabId === 'foto') loadFoto();
}

// ==========================================
// HELPER: POST DATA
// ==========================================
function sendPost(data, successMsg, msgElementId) {
  const msgEl = document.getElementById(msgElementId);
  msgEl.innerText = "Sedang menyimpan...";
  msgEl.className = 'msg';

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // Penting untuk menghindari error CORS
    body: JSON.stringify(data)
  })
  .then(r => r.json())
  .then(res => {
    if(res.status === 'success') {
      msgEl.innerText = successMsg;
      msgEl.className = 'msg success';
      
      // Reset form jika ada (opsional, tapi lebih rapi)
      // document.getElementById(msgElementId).closest('form').reset(); 
      
      // Refresh data otomatis
      if(msgElementId.startsWith('j')) loadJurnal();
      if(msgElementId.startsWith('c')) loadCatatan();
      if(msgElementId.startsWith('d')) loadFoto();

    } else {
      msgEl.innerText = "Gagal: " + res.message;
      msgEl.className = 'msg error';
    }
  })
  .catch(e => {
    console.error(e);
    msgEl.innerText = "Gagal koneksi internet.";
    msgEl.className = 'msg error';
  });
}

// ==========================================
// FITUR JURNAL
// ==========================================
function saveJurnal() {
  if(!confirm("Yakin simpan jurnal ini?")) return;

  const data = {
    action: 'saveJurnal',
    nis: currentUser.nis,
    tanggal: document.getElementById('j-tgl').value,
    kehadiran: document.getElementById('j-hadir').value,
    unit: document.getElementById('j-unit').value,
    catatan: document.getElementById('j-catatan').value
  };
  sendPost(data, "Jurnal berhasil disimpan!", 'j-msg');
}

function loadJurnal() {
  fetch(`${API_URL}?action=getJurnal&nis=${currentUser.nis}`)
    .then(r => r.json())
    .then(data => {
      const tbody = document.querySelector('#tabel-jurnal tbody');
      tbody.innerHTML = '';
      
      if(Array.isArray(data) && data.length > 0) {
        // Urutkan dari yang terbaru
        data.reverse().forEach(d => {
          const row = `
            <tr>
              <td>${d.tanggal}</td>
              <td><span style="font-weight:bold; color:var(--primary)">${d.kehadiran}</span></td>
              <td>${d.unit}</td>
              <td>${d.catatan}</td>
            </tr>`;
          tbody.innerHTML += row;
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#999;">Belum ada data.</td></tr>';
      }
    });
}

// ==========================================
// FITUR CATATAN
// ==========================================
function saveCatatan() {
  if(!confirm("Yakin simpan catatan ini?")) return;

  const data = {
    action: 'saveCatatan',
    nis: currentUser.nis,
    tanggal: document.getElementById('c-tgl').value,
    pekerjaan: document.getElementById('c-kerja').value,
    perencanaan: document.getElementById('c-plan').value,
    pelaksanaan: document.getElementById('c-do').value,
    catatanInstruktur: ''
  };
  sendPost(data, "Catatan berhasil disimpan!", 'c-msg');
}

function loadCatatan() {
  fetch(`${API_URL}?action=getCatatan&nis=${currentUser.nis}`)
    .then(r => r.json())
    .then(data => {
      const tbody = document.querySelector('#tabel-catatan tbody');
      tbody.innerHTML = '';
      
      if(Array.isArray(data) && data.length > 0) {
        data.reverse().forEach(d => {
          const row = `
            <tr>
              <td>${d.tanggal}</td>
              <td>${d.pekerjaan}</td>
              <td>${d.pelaksanaan}</td>
            </tr>`;
          tbody.innerHTML += row;
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#999;">Belum ada catatan.</td></tr>';
      }
    });
}

// ==========================================
// FITUR FOTO
// ==========================================
function uploadFoto() {
  const fileInput = document.getElementById('d-file');
  if(fileInput.files.length === 0) {
    alert("Pilih foto terlebih dahulu!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = {
      action: 'saveDokumentasi',
      nis: currentUser.nis,
      tanggal: document.getElementById('d-tgl').value,
      keterangan: document.getElementById('d-ket').value,
      base64: e.target.result
    };
    sendPost(data, "Foto berhasil diupload!", 'd-msg');
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function loadFoto() {
  fetch(`${API_URL}?action=getDokumentasi&nis=${currentUser.nis}`)
    .then(r => r.json())
    .then(data => {
      const gal = document.getElementById('galeri');
      gal.innerHTML = '';
      
      if(Array.isArray(data) && data.length > 0) {
        data.reverse().forEach(d => {
          let imgUrl = d.url;
          // Konversi URL Google Drive ke thumbnail direct link
          if(imgUrl.includes('drive.google.com')) {
            const id = imgUrl.split('/d/')[1].split('/')[0];
            // Menggunakan ukuran w400 untuk loading lebih cepat
            imgUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w400`;
          }
          
          const item = `
            <div onclick="window.open('${d.url}', '_blank')">
              <img src="${imgUrl}" loading="lazy" alt="Dokumentasi">
              <small>${d.keterangan}</small>
            </div>`;
          gal.innerHTML += item;
        });
      } else {
        gal.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#999;">Belum ada foto dokumentasi.</p>';
      }
    });
}
