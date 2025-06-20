document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    
    let currentImageBase64 = null;
    let compositionChart = null;
    let videoStream = null;

    // --- SETTINGS MANAGEMENT ---
    const getDefaultSettings = () => ({
        provider: 'openrouter',
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        model: 'google/gemma-3-4b-it:free',
        apiKey: '' // MODIFIED: Default API Key is now empty.
    });

    const loadSettings = () => {
        const stored = localStorage.getItem('trashTalksSettings');
        return stored ? JSON.parse(stored) : getDefaultSettings();
    };

    const saveSettings = () => {
        const settings = {
            provider: document.getElementById('ai-provider').value,
            endpoint: document.getElementById('api-endpoint').value,
            model: document.getElementById('model-name').value,
            apiKey: document.getElementById('api-key').value,
        };
        localStorage.setItem('trashTalksSettings', JSON.stringify(settings));
        alert('Pengaturan disimpan!');
        toggleSettingsModal(false);
    };
    
    const applySettingsToForm = () => {
        const settings = loadSettings();
        document.getElementById('ai-provider').value = settings.provider;
        document.getElementById('api-endpoint').value = settings.endpoint;
        document.getElementById('model-name').value = settings.model;
        document.getElementById('api-key').value = settings.apiKey;
    };

    const handleProviderChange = () => {
        const provider = document.getElementById('ai-provider').value;
        const modelInput = document.getElementById('model-name');
        const endpointInput = document.getElementById('api-endpoint');

        switch(provider) {
            case 'openrouter':
                endpointInput.value = 'https://openrouter.ai/api/v1/chat/completions';
                modelInput.placeholder = 'google/gemma-2-9b-it';
                break;
            case 'openai':
                endpointInput.value = 'https://api.openai.com/v1/chat/completions';
                modelInput.placeholder = 'gpt-4o';
                break;
            case 'google':
                endpointInput.value = 'https://generativelanguage.googleapis.com/v1beta/models/';
                modelInput.placeholder = 'gemini-1.5-flash-latest';
                break;
        }
    };

    const toggleSettingsModal = (show) => {
        const modal = document.getElementById('settings-modal');
        if (show) {
            applySettingsToForm();
            modal.classList.add('visible');
        } else {
            modal.classList.remove('visible');
        }
    };

    // --- TEMPLATE INJECTION ---
    function setupInitialHTML() {
        appContainer.innerHTML = `
            <div id="input-stage" class="stage">
                <div id="viewfinder-container">
                    <video id="video-stream" autoplay playsinline muted></video>
                    <img id="image-preview" style="display: none;"/>
                    <div id="camera-error-overlay">
                         <span class="material-symbols-rounded">no_photography</span>
                         <h3>Akses Kamera Ditolak</h3>
                         <p>Untuk melanjutkan, izinkan akses kamera di pengaturan browser Anda dan segarkan halaman.</p>
                    </div>
                </div>
                <div id="controls-overlay">
                    <button class="control-btn" id="settings-button"><span class="material-symbols-rounded">settings</span></button>
                    <button id="shutter-button"></button>
                    <button class="control-btn" id="gallery-button"><span class="material-symbols-rounded">photo_library</span></button>
                </div>
                <button id="analyze-button" class="btn">Analisis</button>
            </div>
            <div id="loading-stage" class="stage">
                 <div class="spinner"></div>
                 <p>Menganalisis komposisi visual...</p>
            </div>
            <div id="result-stage" class="stage"></div>
            <input type="file" id="file-upload" accept="image/*">
        `;
    }
    
    async function startCamera(facingMode = 'environment') {
        if (videoStream) videoStream.getTracks().forEach(track => track.stop());
        
        const videoEl = document.getElementById('video-stream');
        const errorOverlay = document.getElementById('camera-error-overlay');
        
        try {
            videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
            videoEl.srcObject = videoStream;
            videoEl.style.display = 'block';
            errorOverlay.style.display = 'none';
        } catch (err) {
            console.error("Camera Error:", err);
            videoEl.style.display = 'none';
            errorOverlay.style.display = 'flex';
            alert("Akses kamera ditolak. Mohon izinkan akses kamera di pengaturan browser Anda untuk menggunakan fitur ini.");
        }
    }
    
    function showPreview(imageDataUrl) {
        const videoEl = document.getElementById('video-stream');
        const imageEl = document.getElementById('image-preview');
        currentImageBase64 = imageDataUrl;
        imageEl.src = imageDataUrl;
        gsap.to([videoEl, '#camera-error-overlay'], { opacity: 0, duration: 0.3 });
        gsap.set(imageEl, { display: 'block', opacity: 1 });
        gsap.to("#controls-overlay", { opacity: 0, y: 20, duration: 0.3, onComplete: () => gsap.set("#controls-overlay", {visibility: "hidden"}) });
        gsap.set("#analyze-button", { visibility: "visible" });
        gsap.to("#analyze-button", { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' });
    }

    function captureImage() {
        if (!videoStream) {
            alert('Kamera tidak aktif. Tidak bisa mengambil gambar.');
            return;
        }
        const videoEl = document.getElementById('video-stream');
        const canvas = document.createElement('canvas');
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        canvas.getContext('2d').drawImage(videoEl, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        showPreview(dataUrl);
    }
    
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => showPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    }

    // --- AI ANALYSIS ---
    async function analyzeImage() {
        const settings = loadSettings();
        
        if (!settings.apiKey) {
            alert('API Key belum diatur. Silakan masukkan API Key Anda di panel pengaturan (ikon roda gigi).');
            resetToInputStage();
            return;
        }
        
        const promptText = `Anda adalah ahli lingkungan & desainer informasi. Analisis gambar sampah ini. JAWAB HANYA dalam format JSON yang valid tanpa markdown backticks (e.g., \`\`\`json). Gunakan Bahasa Indonesia. Strukturnya harus PERSIS seperti ini:
        {
          "identitas": { "nama_utama": "...", "sub_judul": "..." },
          "fakta_kunci": [
            { "icon": "science", "label": "Material Utama", "value": "..." },
            { "icon": "recycling", "label": "Kode Daur Ulang", "value": "..." },
            { "icon": "thermostat", "label": "Kondisi Umum", "value": "..." }
          ],
          "visualisasi": { "type": "donut_chart", "data": { "labels": ["..."], "values": [...] } },
          "level_daur_ulang": { "level": "Mudah", "keterangan": "..." },
          "linimasa_dampak": { "label": "Perkiraan Waktu Terurai", "value_min": 400, "value_max": 500, "unit": "Tahun" },
          "langkah_aksi": [ { "icon": "cleaning_services", "text": "..." }, { "icon": "recycling", "text": "..." } ],
          "tips_dan_trik": { "judul": "Tahukah Kamu?", "konten_markdown": "..." }
        }`;

        let apiUrl, requestBody, headers;
        
        headers = { 'Content-Type': 'application/json' };
        const base64Data = currentImageBase64.split(',')[1];

        switch(settings.provider) {
            case 'google':
                apiUrl = `${settings.endpoint}${settings.model}:generateContent?key=${settings.apiKey}`;
                requestBody = {
                    contents: [{
                        parts: [
                            { text: promptText },
                            { inline_data: { mime_type: "image/jpeg", data: base64Data } }
                        ]
                    }]
                };
                break;
            case 'openai':
                apiUrl = settings.endpoint;
                headers['Authorization'] = `Bearer ${settings.apiKey}`;
                requestBody = {
                    model: settings.model,
                    response_format: { type: "json_object" }, 
                    messages: [{
                        role: "user",
                        content: [
                            { type: "text", text: promptText },
                            { type: "image_url", image_url: { url: currentImageBase64 } }
                        ]
                    }]
                };
                break;
            case 'openrouter':
            default:
                apiUrl = settings.endpoint;
                headers['Authorization'] = `Bearer ${settings.apiKey}`;
                requestBody = {
                    model: settings.model,
                    messages: [{
                        role: "user",
                        content: [
                            { type: "text", text: promptText },
                            { type: "image_url", image_url: { url: currentImageBase64 } }
                        ]
                    }]
                };
                break;
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}. Pesan: ${errorBody}`);
            }

            const result = await response.json();
            let content;
            
            if (settings.provider === 'google') {
                content = result.candidates[0].content.parts[0].text;
            } else { 
                content = result.choices[0].message.content;
            }

            const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanedContent);
            populateAndAnimateResults(data);

        } catch (error) {
            console.error("Analysis Error:", error);
            alert(`Terjadi kesalahan saat analisis: ${error.message}\n\nPastikan API Key, model, dan endpoint sudah benar.`);
            resetApp();
        }
    }
    
    function populateAndAnimateResults(data) {
        const resultStageEl = document.getElementById('result-stage');
        resultStageEl.innerHTML = `
            <div class="bento-card" id="card-identity"></div>
            <div class="bento-card" id="card-key-facts"></div>
            <div class="bento-card" id="card-composition"></div>
            <div class="bento-card" id="card-recycle-level"></div>
            <div class="bento-card" id="card-impact"></div>
            <div class="bento-card" id="card-actions"></div>
            <div class="bento-card" id="card-tips"></div>
            <div id="reset-button-container"><button id="reset-button-results" class="btn">Analisis Lagi</button></div>
            <footer id="result-footer">Informasi dihasilkan oleh AI dan mungkin memerlukan verifikasi. Gunakan sebagai panduan awal.</footer>
        `;

        // Data Population
        document.getElementById('card-identity').innerHTML = `<img src="${currentImageBase64}" alt="Analyzed trash"/><div id="identity-overlay"><h2>${data.identitas?.nama_utama || 'N/A'}</h2><p>${data.identitas?.sub_judul || 'N/A'}</p></div>`;
        
        const keyFactsHtml = data.fakta_kunci?.map(fact => `
            <div class="fact-item">
                <span class="material-symbols-rounded">${fact.icon || 'check_circle'}</span>
                <span>${fact.label || 'Fakta'}: <strong>${fact.value || 'N/A'}</strong></span>
            </div>
        `).join('') || '<p>Tidak ada fakta kunci.</p>';
        document.getElementById('card-key-facts').innerHTML = `<h3>Fakta Kunci</h3><div class="card-content">${keyFactsHtml}</div>`;
        
        const level = data.level_daur_ulang?.level || 'N/A';
        let statusColor = 'yellow';
        if (level.toLowerCase().includes('mudah')) statusColor = 'green';
        if (level.toLowerCase().includes('sulit') || level.toLowerCase().includes('tidak')) statusColor = 'red';
        document.getElementById('card-recycle-level').innerHTML = `<h3>Level Daur Ulang</h3><div class="card-content"><p><span class="status-chip ${statusColor}">${level}</span></p><p style="font-size:0.8rem; margin-top:0.5rem;">${data.level_daur_ulang?.keterangan || ''}</p></div>`;

        const impact = data.linimasa_dampak;
        const impactTime = (impact?.value_min && impact?.value_max) ? `${impact.value_min} - ${impact.value_max}` : (impact?.waktu_urai || 'N/A');
        const impactUnit = impact?.unit || '';
        document.getElementById('card-impact').innerHTML = `<h3>${impact?.label || 'Linimasa Dampak'}</h3><div class="card-content" style="text-align:center;"><p style="font-size: 2.5rem; font-weight: 700; color: var(--primary-blue);">${impactTime}</p><p>${impactUnit}</p></div>`;
        
        const actionListHtml = data.langkah_aksi?.map(a => `<li><span class="material-symbols-rounded" style="color:var(--primary-blue); vertical-align: middle; margin-right: 0.5rem;">${a.icon}</span>${a.text}</li>`).join('') || '';
        document.getElementById('card-actions').innerHTML = `<h3>Langkah Aksi</h3><div class="card-content"><ul>${actionListHtml}</ul></div>`;
        
        document.getElementById('card-tips').innerHTML = `<h3>${data.tips_dan_trik?.judul || 'Tips & Trik'}</h3><div class="card-content">${marked.parse(data.tips_dan_trik?.konten_markdown || '')}</div>`;
        
        const chartContainer = document.getElementById('card-composition');
        chartContainer.innerHTML = `<h3>Komposisi Material</h3><div class="card-content" style="flex-grow: 1; position: relative;"><canvas id="composition-chart"></canvas></div>`;
        const ctx = document.getElementById('composition-chart').getContext('2d');
        if(data.visualisasi?.data?.labels && data.visualisasi?.data?.values) {
            compositionChart = new Chart(ctx, { type: 'doughnut', data: { labels: data.visualisasi.data.labels, datasets: [{ data: data.visualisasi.data.values, backgroundColor: ['#0052FF', '#85AFFF', '#B3D1FF'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { family: "'Poppins', sans-serif" } } } }, cutout: '70%' } });
        }
        
        document.getElementById('reset-button-results').addEventListener('click', resetApp);
        gsap.timeline()
            .to("#loading-stage", { opacity: 0, duration: 0.4, onComplete: () => gsap.set("#loading-stage", { visibility: "hidden" }) })
            .set("#result-stage", { visibility: "visible", opacity: 1 })
            .from(".bento-card, #result-footer", { y: 50, opacity: 0, duration: 0.8, ease: 'back.out(1.7)', stagger: 0.07 });
    }
    
    function resetApp() {
        gsap.to("#result-stage", { opacity: 0, duration: 0.4, ease: 'power2.in', onComplete: () => {
            if (compositionChart) compositionChart.destroy();
            gsap.set("#result-stage", { visibility: 'hidden' });
            initializeApp(true);
        }});
    }

    function resetToInputStage() {
         gsap.timeline()
            .to("#loading-stage", { opacity: 0, scale: 1.05, duration: 0.4, onComplete: () => gsap.set("#loading-stage", { visibility: "hidden" }) })
            .set("#input-stage", { visibility: "visible", opacity: 0, scale: 0.95 })
            .to("#input-stage", { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
    }

    function initializeApp(isReset = false) {
        setupInitialHTML();
        const tl = gsap.timeline();
        
        if (isReset) {
            tl.set("#input-stage", { visibility: "visible", opacity: 0, scale: 1.05 })
              .to("#input-stage", { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' });
        } else {
            gsap.set("#input-stage", { visibility: "visible", opacity: 1 });
        }

        startCamera();
        document.getElementById('settings-button').addEventListener('click', () => toggleSettingsModal(true));
        document.getElementById('shutter-button').addEventListener('click', captureImage);
        document.getElementById('gallery-button').addEventListener('click', () => document.getElementById('file-upload').click());
        document.getElementById('file-upload').addEventListener('change', handleFileSelect);
        document.getElementById('analyze-button').addEventListener('click', () => {
            gsap.timeline()
                .to("#input-stage", { opacity: 0, scale: 0.95, duration: 0.4, ease: 'power2.in', onComplete: () => gsap.set("#input-stage", { visibility: "hidden" }) })
                .set("#loading-stage", { visibility: "visible", opacity: 0 })
                .to("#loading-stage", { opacity: 1, duration: 0.4, ease: 'power2.out' })
                .call(analyzeImage);
        });

        // Event listeners for the modal are attached here because the modal is part of the initial HTML.
        document.getElementById('close-settings-btn').addEventListener('click', () => toggleSettingsModal(false));
        document.getElementById('ai-provider').addEventListener('change', handleProviderChange);
        document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
        document.getElementById('reset-settings-btn').addEventListener('click', () => {
            if (confirm('Anda yakin ingin mengembalikan pengaturan ke default?')) {
                localStorage.removeItem('trashTalksSettings');
                applySettingsToForm();
            }
        });
    }
    
    initializeApp();
});
