/**
 * 生成分享卡片并触发下载
 * @param {Object} quote - 语录对象
 */
function generateShareCard(quote) {
    if (!quote) return;

    const canvas = document.getElementById('share-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // ===== Background =====
    // 深红渐变
    const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, height
    );
    gradient.addColorStop(0, '#2d0a0a');
    gradient.addColorStop(1, '#1a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

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

    // 自动换行
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

    // ===== Download =====
    downloadCanvas(canvas, `毛主席语录_${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}.png`);
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
    module.exports = { generateShareCard, wrapText, downloadCanvas };
}
