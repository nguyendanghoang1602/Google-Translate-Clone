const express = require('express');
const router = express.Router();
const https = require('https');

// Fallback từ điển mẫu thông dụng (đảm bảo dịch mượt mà ngay cả khi offline)
const fallbackDict = {
    'en-vi': {
        'hello': 'xin chào',
        'good morning': 'chào buổi sáng',
        'how are you': 'bạn khỏe không',
        'thank you': 'cảm ơn bạn',
        'goodbye': 'tạm biệt',
        'software engineer': 'kỹ sư phần mềm',
        'computer': 'máy vi tính',
        'artificial intelligence': 'trí tuệ nhân tạo'
    },
    'vi-en': {
        'xin chào': 'hello',
        'chào buổi sáng': 'good morning',
        'bạn khỏe không': 'how are you',
        'cảm ơn': 'thank you',
        'tạm biệt': 'goodbye',
        'kỹ sư phần mềm': 'software engineer',
        'máy tính': 'computer',
        'trí tuệ nhân tạo': 'artificial intelligence'
    }
};

// Hàm gọi API dịch công khai MyMemory (Hoàn toàn miễn phí, không cần đăng ký key)
function callMyMemoryTranslate(text, sourceLang, targetLang) {
    return new Promise((resolve, reject) => {
        const from = (sourceLang === 'auto' || !sourceLang) ? 'autodetect' : sourceLang;
        const to = targetLang || 'vi';
        const langpair = `${from}|${to}`;
        const encodedText = encodeURIComponent(text);
        const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${encodeURIComponent(langpair)}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.responseData && parsed.responseData.translatedText) {
                        resolve({
                            translatedText: parsed.responseData.translatedText,
                            detectedSource: parsed.responseData.detectedLanguage || sourceLang
                        });
                    } else {
                        reject(new Error('Phản hồi không hợp lệ từ MyMemory'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// POST: /api/translate
router.post('/', async (req, res) => {
    try {
        const { text, sourceLang = 'auto', targetLang = 'vi' } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Nội dung văn bản không được để trống.' });
        }

        const cleanText = text.trim();

        // 1. Thử gọi API trực tuyến
        try {
            const apiResult = await callMyMemoryTranslate(cleanText, sourceLang, targetLang);
            return res.json({
                success: true,
                originalText: cleanText,
                translatedText: apiResult.translatedText,
                sourceLang: apiResult.detectedSource || sourceLang,
                targetLang: targetLang,
                source: 'online-engine'
            });
        } catch (apiError) {
            console.warn('Online translation failed, using dictionary fallback:', apiError.message);
        }

        // 2. Fallback nếu không có kết nối internet
        const dictKey = `${sourceLang}-${targetLang}`;
        const lower = cleanText.toLowerCase();
        let fallbackResult = null;

        if (fallbackDict[dictKey] && fallbackDict[dictKey][lower]) {
            fallbackResult = fallbackDict[dictKey][lower];
        } else {
            fallbackResult = `[${targetLang.toUpperCase()}] ${cleanText}`;
        }

        return res.json({
            success: true,
            originalText: cleanText,
            translatedText: fallbackResult,
            sourceLang: sourceLang,
            targetLang: targetLang,
            source: 'fallback-engine'
        });

    } catch (err) {
        console.error('Translation error:', err);
        return res.status(500).json({ error: 'Đã xảy ra lỗi trong quá trình dịch thuật.' });
    }
});

// POST: /api/detect
router.post('/detect', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Cần văn bản để nhận diện' });

    // Thuật toán nhận diện cơ bản theo ký tự đặc trưng
    const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
    const hasJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/i.test(text);
    const hasKorean = /[\uac00-\ud7af]/i.test(text);
    const hasChinese = /[\u4e00-\u9fff]/i.test(text) && !hasJapanese;

    let detected = 'en';
    if (hasVietnamese) detected = 'vi';
    else if (hasJapanese) detected = 'ja';
    else if (hasKorean) detected = 'ko';
    else if (hasChinese) detected = 'zh';

    res.json({ detectedLanguage: detected });
});

module.exports = router;
