// Pre-load silhouette for share card
const SILHOUETTE_IMG = new Image();
SILHOUETTE_IMG.src = 'assets/mao-silhouette.png';

let lastShareCardData = null;

/**
 * 渲染分享卡片到 Canvas
 * @param {Object} quote - 语录对象
 * @returns {HTMLCanvasElement|null}
 */
function renderShareCard(quote) {
    if (!quote) return null;

    const canvas = document.getElementById('share-canvas');
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // ===== Background =====
    const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, height
    );
    gradient.addColorStop(0, '#2d0a0a');
    gradient.addColorStop(1, '#1a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // ===== Silhouette =====
    if (SILHOUETTE_IMG.complete && SILHOUETTE_IMG.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.12;
        const sHeight = height * 0.7;
        const sWidth = sHeight * (SILHOUETTE_IMG.width / SILHOUETTE_IMG.height);
        const sX = width * 0.55;
        const sY = height * 0.15;
        ctx.drawImage(SILHOUETTE_IMG, sX, sY, sWidth, sHeight);
        ctx.restore();
    }

    // ===== Decorative Line =====
    ctx.strokeStyle = 'rgba(160, 128, 96, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.55);
    ctx.lineTo(width * 0.8, height * 0.55);
    ctx.stroke();

    // ===== Quote Text =====
    ctx.fillStyle = '#f5e6c8';
    ctx.textAlign = 'center';

    const maxWidth = width * 0.75;
    const fontSize = 72;
    ctx.font = `bold ${fontSize}px "Noto Serif SC", "Source Han Serif CN", SimSun, serif`;

    const lines = wrapText(ctx, quote.text, maxWidth);
    const lineHeight = fontSize * 1.5;
    const totalTextHeight = lines.length * lineHeight;
    const startY = (height * 0.45) - (totalTextHeight / 2);

    lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, startY + i * lineHeight);
    });

    // ===== Source =====
    ctx.fillStyle = '#a08060';
    ctx.font = '32px "Noto Serif SC", "Source Han Serif CN", SimSun, serif';
    ctx.fillText(`—— ${quote.source}`, width / 2, height * 0.65);

    // ===== Date =====
    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    ctx.fillStyle = '#a08060';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(dateStr, width / 2, height * 0.78);

    // ===== Brand =====
    ctx.fillStyle = 'rgba(160, 128, 96, 0.6)';
    ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('毛主席语录 · 每日一句', width / 2, height * 0.88);

    return canvas;
}

/**
 * 显示分享卡片预览模态框
 * @param {Object} quote - 语录对象
 */
function showSharePreview(quote) {
    const canvas = renderShareCard(quote);
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    lastShareCardData = {
        dataUrl: dataUrl,
        filename: `毛主席语录_${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}.png`
    };

    const img = document.getElementById('share-preview-img');
    if (img) {
        img.src = dataUrl;
    }

    const overlay = document.getElementById('share-preview-overlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}

/**
 * 下载分享卡片
 */
function downloadShareCard() {
    if (!lastShareCardData) return;

    const link = document.createElement('a');
    link.download = lastShareCardData.filename;
    link.href = lastShareCardData.dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * 关闭分享卡片预览
 */
function closeSharePreview() {
    const overlay = document.getElementById('share-preview-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

/**
 * 文字自动换行
 */
function wrapText(ctx, text, maxWidth) {
    const chars = text.split('');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < chars.length; i++) {
        const testLine = currentLine + chars[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine !== '') {
            lines.push(currentLine);
            currentLine = chars[i];
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    return lines;
}

/**
 * 触发 Canvas 下载
 */
function downloadCanvas(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderShareCard, showSharePreview, downloadShareCard, closeSharePreview, wrapText, downloadCanvas };
}
