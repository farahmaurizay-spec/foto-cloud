// === GANTI dua nilai ini dengan data Cloudinary kamu ===
const cloudName = "di44ecwpq";         
const uploadPreset = "farah_preset";   
// ===================================================

const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const statusP = document.getElementById('status');
const gallery = document.getElementById('gallery');

uploadBtn.addEventListener('click', uploadImage);

// Muat galeri dari localStorage saat halaman dibuka
loadGalleryFromLocal();

async function uploadImage() {
  const file = fileInput.files[0];
  if (!file) {
    alert('Pilih foto dulu ya!');
    return;
  }

  statusP.textContent = 'Uploading...';
  uploadBtn.disabled = true;

  try {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: fd
    });

    const data = await res.json();

    if (data.secure_url) {
      addPhotoToGallery(data.secure_url, data.public_id);
      statusP.textContent = 'Upload berhasil ✅';
      fileInput.value = '';
    } else {
      console.error('Cloudinary response error:', data);
      statusP.textContent = 'Upload gagal — cek console';
      alert('Upload gagal. Cek console (F12) untuk detail.');
    }
  } catch (err) {
    console.error(err);
    statusP.textContent = 'Kesalahan jaringan atau CORS';
    alert('Terjadi kesalahan. Cek koneksi atau console.');
  } finally {
    uploadBtn.disabled = false;
    setTimeout(() => statusP.textContent = '', 2500);
  }
}

function addPhotoToGallery(url, publicId) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${url}" alt="Foto">
    <div class="meta">
      <div>URL: <a href="${url}" target="_blank" rel="noreferrer">lihat</a></div>
      <button class="btn-delete" data-id="${publicId || ''}">Hapus</button>
    </div>
  `;
  gallery.prepend(card);

  saveUrlToLocal(url, publicId);

  const delBtn = card.querySelector('.btn-delete');
  delBtn.addEventListener('click', () => {
    card.remove();
    removeUrlFromLocal(url);
  });
}

function saveUrlToLocal(url, publicId) {
  const items = JSON.parse(localStorage.getItem('myGallery') || '[]');
  items.unshift({ url, publicId, created: Date.now() });
  localStorage.setItem('myGallery', JSON.stringify(items));
}

function removeUrlFromLocal(url) {
  let items = JSON.parse(localStorage.getItem('myGallery') || '[]');
  items = items.filter(x => x.url !== url);
  localStorage.setItem('myGallery', JSON.stringify(items));
}

function loadGalleryFromLocal() {
  const items = JSON.parse(localStorage.getItem('myGallery') || '[]');
  items.forEach(it => addPhotoToGallery(it.url, it.publicId));
}