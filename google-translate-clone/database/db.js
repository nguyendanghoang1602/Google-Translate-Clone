const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

// Khởi tạo file lưu trữ dữ liệu nếu chưa có
function initDB() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            history: [
                {
                    id: 'sample-1',
                    sourceText: 'Hello world! Welcome to Google Translate Clone.',
                    translatedText: 'Chào thế giới! Chào mừng bạn đến với bản sao Google Translate.',
                    sourceLang: 'en',
                    targetLang: 'vi',
                    isStarred: true,
                    createdAt: new Date().toISOString()
                }
            ]
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    }
}

function readDB() {
    initDB();
    try {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Lỗi khi đọc CSDL:', err);
        return { history: [] };
    }
}

function writeDB(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (err) {
        console.error('Lỗi khi ghi CSDL:', err);
        return false;
    }
}

module.exports = {
    getAllHistory: () => {
        const db = readDB();
        return db.history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    addHistoryItem: (item) => {
        const db = readDB();
        const newItem = {
            id: 'trans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            sourceText: item.sourceText,
            translatedText: item.translatedText,
            sourceLang: item.sourceLang || 'auto',
            targetLang: item.targetLang,
            isStarred: false,
            createdAt: new Date().toISOString()
        };
        db.history.unshift(newItem);
        // Giữ lại tối đa 100 bản ghi lịch sử gần nhất
        if (db.history.length > 100) {
            db.history = db.history.slice(0, 100);
        }
        writeDB(db);
        return newItem;
    },
    deleteHistoryItem: (id) => {
        const db = readDB();
        const initialLength = db.history.length;
        db.history = db.history.filter(item => item.id !== id);
        writeDB(db);
        return db.history.length < initialLength;
    },
    clearAllHistory: () => {
        const db = readDB();
        db.history = [];
        writeDB(db);
        return true;
    },
    toggleStar: (id) => {
        const db = readDB();
        const item = db.history.find(item => item.id === id);
        if (item) {
            item.isStarred = !item.isStarred;
            writeDB(db);
            return item;
        }
        return null;
    }
};
