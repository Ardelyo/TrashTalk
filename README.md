

# TrashTalks V7.1: Analisis Sampah Visual dengan AI

[![Versi](https://img.shields.io/badge/version-v7.1-blue.svg)](https://shields.io/)
[![Lisensi](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/Overview.en.html)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://gsap.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

**TrashTalks** adalah sebuah aplikasi web progresif (PWA) yang dirancang untuk memberikan analisis mendalam terhadap objek sampah menggunakan kamera perangkat Anda dan kekuatan kecerdasan buatan (AI). Cukup ambil foto sampah, dan aplikasi akan memberikan informasi terperinci tentang material, tingkat daur ulang, dampak lingkungan, dan langkah-langkah aksi yang dapat Anda ambil.

Versi 7.1 membawa fokus pada **Presisi, Kustomisasi, dan Pengalaman Pengguna (UX)** yang lebih baik.



---

## ✨ Fitur Unggulan

-   **Analisis Visual Instan**: Gunakan kamera Anda atau unggah gambar untuk mengidentifikasi jenis sampah.
-   **Informasi Komprehensif**: Dapatkan data terstruktur mengenai:
    -   **Identitas**: Nama utama dan sub-judul objek.
    -   **Fakta Kunci**: Material utama, kode daur ulang, dan kondisi umum.
    -   **Komposisi**: Visualisasi data dengan *donut chart* yang interaktif.
    -   **Level Daur Ulang**: Status yang jelas (Mudah, Sulit, Tidak Bisa) beserta keterangan.
    -   **Dampak Lingkungan**: Estimasi rentang waktu terurai di alam.
    -   **Langkah Aksi**: Saran konkret yang bisa langsung diterapkan.
-   **Kustomisasi Mesin AI (V7.0)**: Pengguna dapat mengonfigurasi penyedia AI (OpenRouter, OpenAI, Google AI), model, dan API Key mereka sendiri melalui panel pengaturan.
-   **Penyimpanan Lokal**: Pengaturan AI Anda tersimpan dengan aman di `localStorage` browser, tidak perlu memasukkannya berulang kali.
-   **UI Modern & Responsif**: Antarmuka bergaya *Bento Grid* yang adaptif untuk desktop dan seluler, dengan animasi yang mulus menggunakan GSAP.
-   **UX yang Disempurnakan (V7.1)**:
    -   Transisi pemuatan (loading) yang lebih jelas untuk mencegah kesan "layar mati".
    -   Penanganan error yang lebih baik, terutama saat izin kamera ditolak.
    -   Permintaan API yang lebih pintar untuk kompatibilitas model AI yang lebih luas.

---

## 🚀 Cara Menggunakan

Aplikasi ini dirancang sebagai satu file HTML mandiri, sehingga sangat mudah untuk dijalankan.

### 1. Prasyarat

-   Browser modern (Chrome, Firefox, Safari, Edge).
-   Koneksi internet untuk mengakses API AI.

### 2. Menjalankan Aplikasi

-   **Cara Termudah**: Cukup buka file `index.html` (atau nama file HTML yang Anda gunakan) langsung di browser Anda.
-   **Rekomendasi**: Untuk fungsionalitas penuh seperti akses kamera (yang seringkali memerlukan konteks aman `https`), jalankan file melalui server lokal.
    -   Jika Anda memiliki **Visual Studio Code**, Anda bisa menggunakan ekstensi seperti [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
    -   Jika Anda memiliki **Python**, jalankan perintah berikut di direktori proyek:
        ```bash
        # Python 3
        python -m http.server
        ```
        Lalu buka `http://localhost:8000` di browser.

### 3. Konfigurasi Awal (Sangat Penting!)

Aplikasi ini memerlukan API Key agar dapat berfungsi.

1.  Buka aplikasi di browser Anda.
2.  Klik ikon **roda gigi (⚙️)** di pojok kiri bawah pada tampilan kamera untuk membuka panel **Pengaturan AI**.
3.  **Pilih Penyedia AI** Anda (misalnya, OpenRouter, OpenAI).
4.  **Masukkan API Key** Anda pada kolom yang tersedia.
5.  **Masukkan Nama Model** yang ingin Anda gunakan (misalnya, `google/gemma-2-9b-it` untuk OpenRouter, atau `gpt-4o` untuk OpenAI).
6.  Klik tombol **Simpan**.

Sekarang aplikasi siap untuk melakukan analisis!

---

## 🛠️ Teknologi yang Digunakan

-   **Struktur & Tampilan**:
    -   `HTML5`: Kerangka dasar aplikasi.
    -   `CSS3`: Styling modern dengan Variabel CSS, Flexbox, dan Grid.
-   **Logika & Interaktivitas**:
    -   `JavaScript (ES6+)`: Otak dari semua fungsionalitas, termasuk logika API, manipulasi DOM, dan manajemen status.
-   **Pustaka Eksternal**:
    -   **[GSAP (GreenSock Animation Platform)](https://gsap.com/)**: Untuk animasi antarmuka yang lancar dan berperforma tinggi.
    -   **[Chart.js](https://www.chartjs.org/)**: Untuk membuat visualisasi data komposisi material yang interaktif.
    -   **[Marked.js](https://marked.js.org/)**: Untuk mem-parsing konten markdown dari respons AI menjadi HTML yang kaya.
-   **API**:
    -   **Vision AI Models**: Terintegrasi dengan berbagai penyedia AI seperti OpenRouter, OpenAI, dan Google AI (Gemini) untuk analisis gambar.
    -   **WebRTC (`getUserMedia`)**: Untuk mengakses stream kamera perangkat secara real-time.

---

## 📝 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file `LICENSE` untuk detail lebih lanjut.

---

Dibuat dengan ❤️ untuk lingkungan yang lebih baik.
