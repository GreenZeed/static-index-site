export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    setSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    getImageDataURL() {
        return this.canvas.toDataURL('image/png');
    }

    getCanvas() {
        return this.canvas;
    }

    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    applyTextEffect(text, x, y, intensity, effect, color) {
        if (effect === 'shadow') {
            this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
            this.ctx.shadowBlur = intensity * 3;
            this.ctx.shadowOffsetX = intensity;
            this.ctx.shadowOffsetY = intensity;
        } else if (effect === 'glow') {
            this.ctx.shadowColor = this.ctx.fillStyle;
            this.ctx.shadowBlur = intensity * 5;
        } else if (effect === 'neon') {
            for (let i = 0; i < 3; i++) {
                this.ctx.shadowColor = this.ctx.fillStyle;
                this.ctx.shadowBlur = intensity * 8;
                this.ctx.fillText(text, x, y);
            }
        }
        this.ctx.fillText(text, x, y);
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    drawPattern(w, h, pattern) {
        if (pattern === 'none') return;
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        if (pattern === 'stripes') {
            for (let i = 0; i < w + h; i += 40) { this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i - h, h); this.ctx.stroke(); }
        } else if (pattern === 'dots') {
            for (let x = 0; x < w; x += 50) { for (let y = 0; y < h; y += 50) { this.ctx.beginPath(); this.ctx.arc(x, y, 4, 0, Math.PI * 2); this.ctx.fill(); } }
        } else if (pattern === 'hexagons') {
            const size = 30;
            for (let y = 0; y < h; y += size * 1.5) {
                for (let x = 0; x < w; x += size * Math.sqrt(3)) {
                    const offsetX = (y / (size * 1.5)) % 2 === 0 ? 0 : size * Math.sqrt(3) / 2;
                    this.drawHexagon(x + offsetX, y, size);
                }
            }
        } else if (pattern === 'grid') {
            for (let i = 0; i < w; i += 50) { this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i, h); this.ctx.stroke(); }
            for (let i = 0; i < h; i += 50) { this.ctx.beginPath(); this.ctx.moveTo(0, i); this.ctx.lineTo(w, i); this.ctx.stroke(); }
        }
        this.ctx.restore();
    }

    drawHexagon(x, y, size) {
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = x + size * Math.cos(angle);
            const hy = y + size * Math.sin(angle);
            if (i === 0) this.ctx.moveTo(hx, hy);
            else this.ctx.lineTo(hx, hy);
        }
        this.ctx.closePath();
        this.ctx.stroke();
    }

    applyImageFilter(filter) {
        if (filter === 'none') return;
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (filter === 'grayscale') {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = data[i + 1] = data[i + 2] = avg;
            } else if (filter === 'sepia') {
                const r = data[i], g = data[i + 1], b = data[i + 2];
                data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
            } else if (filter === 'contrast') {
                const factor = 2;
                data[i] = Math.min(255, ((data[i] - 128) * factor) + 128);
                data[i + 1] = Math.min(255, ((data[i + 1] - 128) * factor) + 128);
                data[i + 2] = Math.min(255, ((data[i + 2] - 128) * factor) + 128);
            } else if (filter === 'brightness') {
                const brightness = 50;
                data[i] = Math.min(255, data[i] + brightness);
                data[i + 1] = Math.min(255, data[i + 1] + brightness);
                data[i + 2] = Math.min(255, data[i + 2] + brightness);
            }
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    drawSeasonalDecorations(season, w, h) {
        if (season === 'none') return;
        this.ctx.save();
        this.ctx.font = '60px Arial';

        if (season === 'christmas') {
            ['🎄', '❄️', '🎁'].forEach((emoji, i) => {
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillText(emoji, 50 + i * 150, 80);
                this.ctx.fillText(emoji, w - 200 + i * 60, h - 50);
            });
        } else if (season === 'summer') {
            ['☀️', '🌴', '🌊'].forEach((emoji, i) => {
                this.ctx.globalAlpha = 0.25;
                this.ctx.fillText(emoji, 60 + i * 140, 70);
            });
        } else if (season === 'playoffs') {
            ['🏆', '⭐', '🥇'].forEach((emoji, i) => {
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillText(emoji, w/2 - 90 + i * 90, 50);
            });
        } else if (season === 'halloween') {
            ['🎃', '👻', '🦇'].forEach((emoji, i) => {
                this.ctx.globalAlpha = 0.25;
                this.ctx.fillText(emoji, 50 + i * 130, 80);
            });
        } else if (season === 'valentine') {
            ['❤️', '💖', '💘'].forEach((emoji, i) => {
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillText(emoji, w - 200, 100 + i * 100);
            });
        }

        this.ctx.restore();
    }
}
