// ==========================================
// KONFIGURASI
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzLoxmetak_qMqwddoJpPzOLSyGOs0jJuJ1pSRaF4irBUu0Sf0Ej6SN5yC3r2tZ0tNQ/exec"; 
// Ganti di atas dengan URL Web App dari Google Apps Script (yang berakhiran /exec)

// ==========================================
// LOGIC UTAMA
// ==========================================

let currentNIS = null;
let saveTimeout = null;

// Event Listener untuk Login
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const nis = document.getElementById('nis-input').value.trim();
    if (nis) {
        login(nis);
    }
});

// Fungsi Login
function login(nis) {
    currentNIS = nis;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('user-display').textContent = "NIS: " + nis;
    document.getElementById('siswa_nis_display').value = nis;
    
    loadDataFromSheet();
    generateJournalTables();
}

function logout() {
    location.reload();
}

// ==========================================
// DATA HANDLING (GOOGLE SHEETS)
// ==========================================

// Load Data saat login
function loadDataFromSheet() {
    showToast("Memuat data...");
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=read&nis=${currentNIS}`)
        .then(response => response.json())
        .then(data => {
            fillForm(data);
            showToast("Data berhasil dimuat!");
        })
        .catch(error => {
            console.error('Error:', error);
            showToast("Gagal memuat data.");
        });
}

// Save Data (Auto-save dengan Debounce)
// Debounce mencegah request spam saat user sedang mengetik cepat
function scheduleSave() {
    if (!currentNIS) return;
    
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveDataToSheet();
    }, 1500); // Simpan 1.5 detik setelah user berhenti mengetik
}

function saveDataToSheet() {
    showToast("Menyimpan data...");
    
    const inputs = document.querySelectorAll('.save-trigger');
    const formData = {};
    
    inputs.forEach(input => {
        if (input.name) {
            formData[input.name] = input.value;
        }
    });

    const payload = {
        nis: currentNIS,
        data: formData
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(result => {
        if(result.status === 'success') {
            // Optional: Show silent save icon, but toast is enough
        }
    })
    .catch(error => console.error('Error:', error));
}

// Mengisi Form dari Data JSON
function fillForm(data) {
    const inputs = document.querySelectorAll('.save-trigger');
    inputs.forEach(input => {
        if (input.name && data[input.name] !== undefined) {
            input.value = data[input.name];
        }
    });
}

// Pasang Event Listener ke semua input yang ada class .save-trigger
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.save-trigger');
    inputs.forEach(input => {
        input.addEventListener('input', scheduleSave);
    });
});

// ==========================================
// NAVIGASI & UI
// ==========================================

function showSection(sectionId) {
    document.querySelectorAll('main .paper').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
    
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function showToast(message) {
    var x = document.getElementById("toast");
    x.textContent = message;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function previewImage(event) {
    var reader = new FileReader();
    reader.onload = function(){
        var output = document.getElementById('photo-placeholder');
        output.innerHTML = '<img src="'+reader.result+'" style="width:100%; height:100%; object-fit:cover;">';
    };
    reader.readAsDataURL(event.target.files[0]);
}

// ==========================================
// GENERATE JURNAL
// ==========================================
function generateJournalTables() {
    const container = document.getElementById('journal-months-container');
    const tabContainer = document.querySelector('#jurnal .tabs');
    
    if(container.children.length > 0) return; // Sudah ada

    const headerHtml = `
        <h3 class="section-title">JURNAL KEGIATAN PKL</h3>
        <table>
            <tr><td style="width: 200px;">Nama Peserta Didik</td><td>: <input type="text" name="siswa_nama" class="save-trigger" readonly style="display:inline-block; width: 80%; border:none;"></td></tr>
            <tr><td>Dunia Kerja Tempat PKL</td><td>: <input type="text" name="dudika_nama" class="save-trigger" readonly style="display:inline-block; width: 80%; border:none;"></td></tr>
            <tr><td>Nama Instruktur</td><td>: <input type="text" name="dudika_instruktur_jurnal" class="save-trigger" style="display:inline-block; width: 80%; border:none;"></td></tr>
            <tr><td>Nama Guru Pembimbing</td><td>: <input type="text" name="guru_pembimbing_jurnal" class="save-trigger" style="display:inline-block; width: 80%; border:none;"></td></tr>
        </table>
    `;

    for(let i=1; i<=6; i++) {
        // Tab
        const btn = document.createElement('button');
        btn.className = i === 1 ? 'tab-btn active' : 'tab-btn';
        btn.textContent = 'Bulan ' + i;
        btn.onclick = function(e) { openTab(e, 'month-'+i); };
        tabContainer.appendChild(btn);

        // Content
        const div = document.createElement('div');
        div.id = 'month-' + i;
        div.className = i === 1 ? 'tab-content active' : 'tab-content';
        
        let tableRows = '';
        for(let day=1; day<=31; day++) {
            tableRows += `
                <tr>
                    <td style="text-align:center;">${day}</td>
                    <td style="width: 100px;"><input type="date" class="input-no-border save-trigger"></td>
                    <td><input class="input-no-border save-trigger" type="text" placeholder="Pekerjaan"></td>
                    <td><input class="input-no-border save-trigger" type="text" placeholder="Catatan"></td>
                </tr>
            `;
        }

        div.innerHTML = `
            <div style="page-break-after: always;">
                ${headerHtml}
                <table style="margin-top:10px;">
                    <thead><tr><th style="width: 30px;">No</th><th style="width: 120px;">Tanggal</th><th>Pekerjaan</th><th>Catatan</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
                <div class="signature-box"><p>Pimpinan DUDIKA</p><div class="signature-space"></div></div>
            </div>
        `;
        container.appendChild(div);
    }
}
