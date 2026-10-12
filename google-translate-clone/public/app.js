// State Management
let currentFilter = 'all';
let isRecognizing = false;
let recognition = null;
let debounceTimeout = null;

// DOM Elements
const sourceTextEl = document.getElementById('sourceText');
const targetTextEl = document.getElementById('targetText');
const sourceLangSelect = document.getElementById('sourceLangSelect');
const targetLangSelect = document.getElementById('targetLangSelect');
const swapLangBtn = document.getElementById('swapLangBtn');
const clearBtn = document.getElementById('clearBtn');
const charCountEl = document.getElementById('charCount');
const manualTranslateBtn = document.getElementById('manualTranslateBtn');
const loadingSpinner = document.getElementById('loadingSpinner');

const speechInputBtn = document.getElementById('speechInputBtn');
const listenSourceBtn = document.getElementById('listenSourceBtn');
const listenTargetBtn = document.getElementById('listenTargetBtn');
const copyBtn = document.getElementById('copyBtn');
const starCurrentBtn = document.getElementById('starCurrentBtn');

const sidebarDrawer = document.getElementById('sidebarDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const openHistoryBtn = document.getElementById('openHistoryBtn');
const openSavedBtn = document.getElementById('openSavedBtn');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');
const historyListEl = document.getElementById('historyList');
const filterAllBtn = document.getElementById('filterAllBtn');
const filterStarredBtn = document.getElementById('filterStarredBtn');
const clearAllHistoryBtn = document.getElementById('clearAllHistoryBtn');
const drawerTitle = document.getElementById('drawerTitle');

const tabDocBtn = document.getElementById('tabDocBtn');
const fileInput = document.getElementById('fileInput');
const toastEl = document.getElementById('toastMessage');

// Hiển thị Toast thông báo
function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 2500);
}

// Cập nhật bộ đếm ký tự
function updateCharCount() {
    const len = sourceTextEl.value.length;
    charCountEl.textContent = `${len.toLocaleString()} / 5,000`;
    clearBtn.style.display = len > 0 ? 'block' : 'none';
}

// Gọi API Dịch thuật
async function executeTranslation() {
    const text = sourceTextEl.value.trim();
    if (!text) {
        targetTextEl.textContent = 'Bản dịch sẽ hiển thị ở đây...';
        return;
    }

    loadingSpinner.style.display = 'flex';
    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                sourceLang: sourceLangSelect.value,
                targetLang: targetLangSelect.value
            })
        });
        const data = await response.json();

        if (data.success) {
            targetTextEl.textContent = data.translatedText;
            // Lưu vào lịch sử
            saveToHistory(text, data.translatedText, data.sourceLang, data.targetLang);
        } else {
            targetTextEl.textContent = 'Lỗi: ' + (data.error || 'Không thể dịch');
        }
    } catch (err) {
        console.error(err);
        targetTextEl.textContent = 'Lỗi kết nối tới máy chủ dịch thuật.';
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Lưu bản dịch vào History API
async function saveToHistory(sourceText, translatedText, sourceLang, targetLang) {
    try {
        await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceText, translatedText, sourceLang, targetLang })
        });
    } catch (e) {
        console.warn('Lỗi khi lưu lịch sử:', e);
    }
}

// Tự động nhận diện & kích hoạt dịch debounce khi gõ phím
sourceTextEl.addEventListener('input', () => {
    updateCharCount();
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        executeTranslation();
    }, 600);
});

// Nút Xóa văn bản
clearBtn.addEventListener('click', () => {
    sourceTextEl.value = '';
    targetTextEl.textContent = 'Bản dịch sẽ hiển thị ở đây...';
    updateCharCount();
    sourceTextEl.focus();
});

// Nút Đảo chiều ngôn ngữ
swapLangBtn.addEventListener('click', () => {
    const src = sourceLangSelect.value;
    const tgt = targetLangSelect.value;
    if (src === 'auto') {
        showToast('Không thể đảo chiều khi đang chọn Tự động nhận diện');
        return;
    }
    sourceLangSelect.value = tgt;
    targetLangSelect.value = src;

    // Đổi chéo luôn cả nội dung văn bản
    const curTarget = targetTextEl.textContent;
    if (curTarget && curTarget !== 'Bản dịch sẽ hiển thị ở đây...') {
        sourceTextEl.value = curTarget;
        updateCharCount();
        executeTranslation();
    }
});

// Thay đổi select ngôn ngữ
sourceLangSelect.addEventListener('change', executeTranslation);
targetLangSelect.addEventListener('change', executeTranslation);
manualTranslateBtn.addEventListener('click', executeTranslation);

// Text-to-Speech (Đọc to bằng giọng nói)
function speakText(text, lang) {
    if (!('speechSynthesis' in window)) {
        showToast('Trình duyệt không hỗ trợ Text-to-Speech.');
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'vi' ? 'vi-VN' : (lang === 'en' ? 'en-US' : lang);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
}

listenSourceBtn.addEventListener('click', () => {
    const text = sourceTextEl.value.trim();
    if (text) speakText(text, sourceLangSelect.value === 'auto' ? 'en' : sourceLangSelect.value);
});

listenTargetBtn.addEventListener('click', () => {
    const text = targetTextEl.textContent.trim();
    if (text && text !== 'Bản dịch sẽ hiển thị ở đây...') {
        speakText(text, targetLangSelect.value);
    }
});

// Sao chép kết quả
copyBtn.addEventListener('click', () => {
    const text = targetTextEl.textContent.trim();
    if (text && text !== 'Bản dịch sẽ hiển thị ở đây...') {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Đã sao chép bản dịch vào bộ nhớ tạm!');
        });
    }
});

// Speech-to-Text (Microphone)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        isRecognizing = true;
        speechInputBtn.classList.add('recording');
        showToast('Đang lắng nghe giọng nói...');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        sourceTextEl.value = transcript;
        updateCharCount();
        executeTranslation();
    };

    recognition.onerror = (e) => {
        console.error(e);
        showToast('Lỗi nhận diện âm thanh.');
    };

    recognition.onend = () => {
        isRecognizing = false;
        speechInputBtn.classList.remove('recording');
    };
}

speechInputBtn.addEventListener('click', () => {
    if (!recognition) {
        showToast('Trình duyệt không hỗ trợ nhận diện giọng nói (Web Speech API).');
        return;
    }
    if (isRecognizing) {
        recognition.stop();
    } else {
        recognition.lang = sourceLangSelect.value === 'vi' ? 'vi-VN' : 'en-US';
        recognition.start();
    }
});

// Tải file tài liệu .txt
tabDocBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        sourceTextEl.value = event.target.result;
        updateCharCount();
        executeTranslation();
        showToast(`Đã đọc nội dung file ${file.name}`);
    };
    reader.readAsText(file);
});

// Sidebar History Drawer
async function loadHistory() {
    try {
        const res = await fetch('/api/history');
        const data = await res.json();
        if (data.success) {
            renderHistory(data.data);
        }
    } catch (e) {
        console.error(e);
    }
}

function renderHistory(items) {
    historyListEl.innerHTML = '';
    const filtered = currentFilter === 'starred' ? items.filter(x => x.isStarred) : items;

    if (filtered.length === 0) {
        historyListEl.innerHTML = '<div style="color:#5f6368; text-align:center; padding:30px 0;">Không có bản ghi nào</div>';
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div class="langs-tag">${item.sourceLang} → ${item.targetLang}</div>
            <div class="source">${escapeHtml(item.sourceText)}</div>
            <div class="target">${escapeHtml(item.translatedText)}</div>
            <div class="history-card-actions">
                <button class="icon-btn star-item-btn" title="Đánh dấu sao">
                    <span class="material-symbols-outlined" style="font-size:18px; color:${item.isStarred ? '#fbbc05' : 'inherit'}">
                        ${item.isStarred ? 'star' : 'star_border'}
                    </span>
                </button>
                <button class="icon-btn delete-item-btn" title="Xóa">
                    <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
                </button>
            </div>
        `;

        card.querySelector('.star-item-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            await fetch(`/api/history/toggle-star/${item.id}`, { method: 'POST' });
            loadHistory();
        });

        card.querySelector('.delete-item-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            await fetch(`/api/history/${item.id}`, { method: 'DELETE' });
            loadHistory();
        });

        card.addEventListener('click', () => {
            sourceTextEl.value = item.sourceText;
            targetTextEl.textContent = item.translatedText;
            sourceLangSelect.value = item.sourceLang;
            targetLangSelect.value = item.targetLang;
            updateCharCount();
            closeDrawer();
        });

        historyListEl.appendChild(card);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openDrawer(mode = 'all') {
    currentFilter = mode;
    drawerTitle.textContent = mode === 'starred' ? 'Từ vựng đã lưu' : 'Lịch sử dịch';
    if (mode === 'starred') {
        filterStarredBtn.classList.add('active');
        filterAllBtn.classList.remove('active');
    } else {
        filterAllBtn.classList.add('active');
        filterStarredBtn.classList.remove('active');
    }
    sidebarDrawer.classList.add('open');
    drawerOverlay.classList.add('active');
    loadHistory();
}

function closeDrawer() {
    sidebarDrawer.classList.remove('open');
    drawerOverlay.classList.remove('active');
}

openHistoryBtn.addEventListener('click', () => openDrawer('all'));
openSavedBtn.addEventListener('click', () => openDrawer('starred'));
closeDrawerBtn.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

filterAllBtn.addEventListener('click', () => {
    currentFilter = 'all';
    filterAllBtn.classList.add('active');
    filterStarredBtn.classList.remove('active');
    loadHistory();
});

filterStarredBtn.addEventListener('click', () => {
    currentFilter = 'starred';
    filterStarredBtn.classList.add('active');
    filterAllBtn.classList.remove('active');
    loadHistory();
});

clearAllHistoryBtn.addEventListener('click', async () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử dịch?')) {
        await fetch('/api/history', { method: 'DELETE' });
        loadHistory();
        showToast('Đã xóa tất cả lịch sử');
    }
});

// Khởi tạo ban đầu
updateCharCount();
