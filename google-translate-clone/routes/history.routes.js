const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/history - Lấy danh sách lịch sử
router.get('/', (req, res) => {
    try {
        const history = db.getAllHistory();
        res.json({ success: true, data: history });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi tải lịch sử.' });
    }
});

// POST /api/history - Lưu bản dịch mới
router.post('/', (req, res) => {
    try {
        const { sourceText, translatedText, sourceLang, targetLang } = req.body;
        if (!sourceText || !translatedText) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
        }
        const created = db.addHistoryItem({
            sourceText,
            translatedText,
            sourceLang,
            targetLang
        });
        res.status(201).json({ success: true, data: created });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi lưu lịch sử.' });
    }
});

// DELETE /api/history/:id - Xóa 1 bản ghi
router.delete('/:id', (req, res) => {
    try {
        const success = db.deleteHistoryItem(req.params.id);
        if (success) {
            res.json({ success: true, message: 'Đã xóa thành công.' });
        } else {
            res.status(404).json({ error: 'Không tìm thấy bản ghi.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi xóa lịch sử.' });
    }
});

// DELETE /api/history - Xóa tất cả
router.delete('/', (req, res) => {
    try {
        db.clearAllHistory();
        res.json({ success: true, message: 'Đã xóa toàn bộ lịch sử.' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi xóa tất cả lịch sử.' });
    }
});

// POST /api/history/toggle-star/:id - Bật/tắt đánh dấu sao
router.post('/toggle-star/:id', (req, res) => {
    try {
        const updated = db.toggleStar(req.params.id);
        if (updated) {
            res.json({ success: true, data: updated });
        } else {
            res.status(404).json({ error: 'Không tìm thấy bản ghi.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái yêu thích.' });
    }
});

module.exports = router;
