import { CLUB_THEMES, SEASON_THEMES, DEFAULT_DATA, FORMATS } from './constants.js';
import { StateManager } from './state.js';
import { CanvasRenderer } from './renderer.js';
import { UIManager } from './ui.js';

class SportVisualApp {
    constructor() {
        this.stateManager = new StateManager();
        this.renderer = new CanvasRenderer('canvas');
        this.uiManager = new UIManager({
            onClubChange: (club) => this.handleClubChange(club),
            onSeasonChange: (season) => this.handleSeasonChange(season),
            onTemplateChange: (template) => this.handleTemplateChange(template),
            onFormatChange: (format) => this.handleFormatChange(format),
            onFontChange: (font) => this.handleFontChange(font),
            onPatternChange: (pattern) => this.handlePatternChange(pattern),
            onEffectChange: (effect) => this.handleEffectChange(effect),
            onEffectIntensityChange: (intensity) => this.handleEffectIntensityChange(intensity),
            onFilterChange: (filter) => this.handleFilterChange(filter),
            onDownload: () => this.handleDownload(),
            onShare: (platform) => this.handleShare(platform),
            onSaveTemplate: () => this.handleSaveTemplate(),
            onReset: () => this.handleReset(),
            onUndo: () => this.handleUndo(),
            onRedo: () => this.handleRedo(),
            onZoom: (delta) => this.handleZoom(delta),
            onZoomReset: () => this.handleZoomReset()
        });

        this.currentState = {
            template: 'match',
            format: 'square',
            font: 'Inter',
            pattern: 'none',
            effect: 'none',
            effectIntensity: 5,
            filter: 'none',
            club: 'custom',
            season: 'none',
            zoom: 1
        };

        this.init();
    }

    init() {
        this.stateManager.init(DEFAULT_DATA);
        this.uiManager.init();
        this.uiManager.renderSavedTemplates(this.getSavedTemplates(), (index) => this.loadTemplate(index), (index) => this.deleteTemplate(index));
        this.saveToHistory();
        this.renderForm();
        this.updateFormatInfo();
        this.render();
    }

    handleClubChange(club) {
        this.currentState.club = club;
        if (club === 'custom') return;
        const theme = CLUB_THEMES[club];

        if (theme) {
            if (this.currentState.template !== 'upnext') {
                this.stateManager.data[this.currentState.template].color1 = theme.color1;
                this.stateManager.data[this.currentState.template].color2 = theme.color2;
            } else {
                this.stateManager.data.upnext.colorHeader = theme.color1;
            }
            this.renderForm();
            this.saveToHistory();
            this.render();
            this.uiManager.showNotification(`🏆 Thème ${theme.name} appliqué !`);
        }
    }

    handleSeasonChange(season) {
        this.currentState.season = season;
        if (season === 'none') {
            this.saveToHistory();
            this.render();
            return;
        }
        const theme = SEASON_THEMES[season];
        if (theme) {
            if (this.currentState.template !== 'upnext') {
                this.stateManager.data[this.currentState.template].color1 = theme.color1;
                this.stateManager.data[this.currentState.template].color2 = theme.color2;
            } else {
                this.stateManager.data.upnext.colorHeader = theme.color1;
            }
            this.renderForm();
            this.saveToHistory();
            this.render();
            this.uiManager.showNotification(`${theme.emoji} Thème ${theme.label} appliqué !`);
        }
    }

    handleTemplateChange(template) {
        this.currentState.template = template;
        this.renderForm();
        this.render();
    }

    handleFormatChange(format) {
        this.currentState.format = format;
        this.updateFormatInfo();
        this.render();
    }

    handleFontChange(font) {
        this.currentState.font = font;
        this.render();
    }

    handlePatternChange(pattern) {
        this.currentState.pattern = pattern;
        this.saveToHistory();
        this.render();
    }

    handleEffectChange(effect) {
        this.currentState.effect = effect;
        this.saveToHistory();
        this.render();
    }

    handleEffectIntensityChange(intensity) {
        this.currentState.effectIntensity = intensity;
        this.render();
    }

    handleFilterChange(filter) {
        this.currentState.filter = filter;
        this.saveToHistory();
        this.render();
    }

    handleDataChange(key, value) {
        if (key === 'matches') {
            // value is { index, key, value }
             this.stateManager.data.upnext.matches[value.index][value.key] = value.value;
             // handle logic for adding/removing matches if numMatches changed in renderForm
        } else if (key === 'numMatches') {
             const oldNum = this.stateManager.data.upnext.numMatches;
             this.stateManager.data.upnext.numMatches = value;
             if (value > oldNum) {
                for (let i = oldNum; i < value; i++) {
                    this.stateManager.data.upnext.matches.push({ homeTeam: 'ÉQUIPE A', awayTeam: 'ÉQUIPE B', date: 'SAM 14 OCT', time: '14H00', stadium: 'STADE', homeLogo: null, awayLogo: null });
                }
            } else {
                this.stateManager.data.upnext.matches = this.stateManager.data.upnext.matches.slice(0, value);
            }
             this.renderForm(); // Re-render form to update match fields
        } else {
            this.stateManager.data[this.currentState.template][key] = value;
        }

        this.stateManager.saveToStorage();
        this.render();
    }

    renderForm() {
        const data = this.currentState.template === 'upnext' ? this.stateManager.data.upnext : this.stateManager.data[this.currentState.template];
        this.uiManager.renderForm(this.currentState.template, data, (key, value) => this.handleDataChange(key, value));
    }

    updateFormatInfo() {
        this.uiManager.updateFormatInfo(FORMATS[this.currentState.format].label);
    }

    render() {
        const format = FORMATS[this.currentState.format];
        this.renderer.setSize(format.width, format.height);

        const renderers = {
            match: () => this.renderMatchTemplate(),
            score: () => this.renderScoreTemplate(),
            player: () => this.renderPlayerTemplate(),
            ranking: () => this.renderRankingTemplate(),
            upnext: () => this.renderUpNextTemplate()
        };
        renderers[this.currentState.template]();
        if (this.currentState.template !== 'upnext') {
            this.renderer.drawSeasonalDecorations(this.currentState.season, format.width, format.height);
        }
        this.renderer.applyImageFilter(this.currentState.filter);
    }

    renderMatchTemplate() {
        const d = this.stateManager.data.match;
        const w = this.renderer.canvas.width;
        const h = this.renderer.canvas.height;
        const ctx = this.renderer.ctx;

        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, d.color1); gradient.addColorStop(1, d.color2);
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);

        this.renderer.drawPattern(w, h, this.currentState.pattern);

        const renderContent = () => {
             const font = this.currentState.font;
            ctx.fillStyle = 'rgba(255,255,255,0.95)'; this.renderer.roundRect(w/2 - 200, 100, 400, 80, 40); ctx.fill();
            ctx.fillStyle = d.color1; ctx.font = `bold 36px ${font}, sans-serif`; ctx.textAlign = 'center';
            this.renderer.applyTextEffect('MATCH À VENIR', w/2, 155, this.currentState.effectIntensity, this.currentState.effect);

            ctx.font = `bold ${d.textSize}px ${font}, sans-serif`; ctx.fillStyle = 'white';
            this.renderer.applyTextEffect(d.homeTeam, w/2, h/2 - 100, this.currentState.effectIntensity, this.currentState.effect);

            ctx.font = `bold 60px ${font}, sans-serif`; ctx.fillStyle = 'rgba(255,255,255,0.8)';
            this.renderer.applyTextEffect('VS', w/2, h/2, this.currentState.effectIntensity, this.currentState.effect);

            ctx.font = `bold ${d.textSize}px ${font}, sans-serif`; ctx.fillStyle = 'white';
            this.renderer.applyTextEffect(d.awayTeam, w/2, h/2 + 100, this.currentState.effectIntensity, this.currentState.effect);

            ctx.fillStyle = 'rgba(255,255,255,0.95)'; this.renderer.roundRect(120, h - 300, w - 240, 200, 30); ctx.fill();

            ctx.fillStyle = '#1f2937'; ctx.font = `bold 40px ${font}, sans-serif`;
            this.renderer.applyTextEffect(d.date, w/2, h - 220, this.currentState.effectIntensity, this.currentState.effect);

            ctx.font = `bold 50px ${font}, sans-serif`;
            this.renderer.applyTextEffect(d.time, w/2, h - 160, this.currentState.effectIntensity, this.currentState.effect);

            ctx.font = `600 32px ${font}, sans-serif`; ctx.fillStyle = d.color1;
            this.renderer.applyTextEffect(d.stadium, w/2, h - 110, this.currentState.effectIntensity, this.currentState.effect);
        };

        if (d.bgImage) {
            const img = new Image();
            img.src = d.bgImage;
            img.onload = () => {
                ctx.drawImage(img, 0, 0, w, h);
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(0, 0, w, h);
                this.renderer.drawPattern(w, h, this.currentState.pattern);
                renderContent();
                // We need to re-apply filter here because async image loading might clear it or draw over it
                 this.renderer.applyImageFilter(this.currentState.filter);
            };
        } else {
            renderContent();
        }
    }

    renderScoreTemplate() {
        const d = this.stateManager.data.score;
        const w = this.renderer.canvas.width;
        const h = this.renderer.canvas.height;
        const font = this.currentState.font;
        const ctx = this.renderer.ctx;

        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, w, h);
        this.renderer.drawPattern(w, h, this.currentState.pattern);

        const gradient = ctx.createLinearGradient(0, 0, w, h); gradient.addColorStop(0, d.color1); gradient.addColorStop(1, d.color2);
        ctx.fillStyle = gradient; this.renderer.roundRect(w/2 - 200, 100, 400, 80, 40); ctx.fill();

        ctx.fillStyle = 'white'; ctx.font = `bold 36px ${font}, sans-serif`; ctx.textAlign = 'center';
        this.renderer.applyTextEffect('SCORE FINAL', w/2, 155, this.currentState.effectIntensity, this.currentState.effect);

        ctx.font = `600 28px ${font}, sans-serif`; ctx.fillStyle = 'rgba(255,255,255,0.6)';
        this.renderer.applyTextEffect(d.competition, w/2, 220, this.currentState.effectIntensity, this.currentState.effect);

        ctx.fillStyle = 'rgba(255,255,255,0.05)'; this.renderer.roundRect(100, h/2 - 250, w - 200, 500, 40); ctx.fill();

        if (d.homeLogo) { const img = new Image(); img.src = d.homeLogo; img.onload = () => { ctx.drawImage(img, w/2 - 290, h/2 - 200, 100, 100); this.renderer.applyImageFilter(this.currentState.filter); } }
        if (d.awayLogo) { const img = new Image(); img.src = d.awayLogo; img.onload = () => { ctx.drawImage(img, w/2 + 190, h/2 - 200, 100, 100); this.renderer.applyImageFilter(this.currentState.filter); } }

        ctx.fillStyle = 'white'; ctx.font = `bold ${d.textSize}px ${font}, sans-serif`;
        this.renderer.applyTextEffect(d.homeTeam, w/2 - 200, h/2 - 100, this.currentState.effectIntensity, this.currentState.effect);

        ctx.font = `bold 140px ${font}, sans-serif`; ctx.fillStyle = d.color1;
        this.renderer.applyTextEffect(d.homeScore.toString(), w/2 - 200, h/2 + 50, this.currentState.effectIntensity, this.currentState.effect);

        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = `bold 60px ${font}, sans-serif`;
        this.renderer.applyTextEffect('-', w/2, h/2 + 50, this.currentState.effectIntensity, this.currentState.effect);

        ctx.fillStyle = 'white'; ctx.font = `bold ${d.textSize}px ${font}, sans-serif`;
        this.renderer.applyTextEffect(d.awayTeam, w/2 + 200, h/2 - 100, this.currentState.effectIntensity, this.currentState.effect);

        ctx.font = `bold 140px ${font}, sans-serif`; ctx.fillStyle = 'rgba(255,255,255,0.5)';
        this.renderer.applyTextEffect(d.awayScore.toString(), w/2 + 200, h/2 + 50, this.currentState.effectIntensity, this.currentState.effect);

        ctx.font = `600 32px ${font}, sans-serif`; ctx.fillStyle = 'rgba(255,255,255,0.5)';
        this.renderer.applyTextEffect(d.date, w/2, h - 100, this.currentState.effectIntensity, this.currentState.effect);
    }

    renderPlayerTemplate() {
        const d = this.stateManager.data.player;
        const w = this.renderer.canvas.width;
        const h = this.renderer.canvas.height;
        const font = this.currentState.font;
        const ctx = this.renderer.ctx;

        const gradient = ctx.createLinearGradient(0, 0, w, h); gradient.addColorStop(0, d.color1); gradient.addColorStop(1, d.color2);
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);

        this.renderer.drawPattern(w, h, this.currentState.pattern);

        if (d.playerPhoto) {
            const img = new Image();
            img.src = d.playerPhoto;
            img.onload = () => {
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.drawImage(img, w - 600, 0, 600, h);
                ctx.restore();
                this.renderer.applyImageFilter(this.currentState.filter);
            };
        }

        ctx.fillStyle = 'rgba(255,255,255,0.95)'; this.renderer.roundRect(w/2 - 250, 80, 500, 100, 50); ctx.fill();

        ctx.fillStyle = d.color1; ctx.font = `bold 42px ${font}, sans-serif`; ctx.textAlign = 'center';
        this.renderer.applyTextEffect('JOUEUR DU MATCH', w/2, 145, this.currentState.effectIntensity, this.currentState.effect);

        ctx.fillStyle = 'white'; ctx.font = `bold ${d.textSize}px ${font}, sans-serif`;
        this.renderer.applyTextEffect(d.playerName, w/2, h/2 - 50, this.currentState.effectIntensity, this.currentState.effect);

        ctx.fillStyle = 'rgba(255,255,255,0.95)'; this.renderer.roundRect(w/2 - 100, h/2 - 20, 200, 200, 100); ctx.fill();

        ctx.fillStyle = d.color1; ctx.font = `bold 120px ${font}, sans-serif`;
        this.renderer.applyTextEffect(d.number, w/2, h/2 + 110, this.currentState.effectIntensity, this.currentState.effect);

        ctx.fillStyle = 'white'; ctx.font = `600 40px ${font}, sans-serif`;
        this.renderer.applyTextEffect(d.position, w/2, h/2 + 220, this.currentState.effectIntensity, this.currentState.effect);

        ctx.font = `600 32px ${font}, sans-serif`; ctx.fillStyle = 'rgba(255,255,255,0.9)';
        this.renderer.applyTextEffect(d.stats, w/2, h - 150, this.currentState.effectIntensity, this.currentState.effect);

        ctx.font = `bold 36px ${font}, sans-serif`;
        this.renderer.applyTextEffect(d.team, w/2, h - 80, this.currentState.effectIntensity, this.currentState.effect);
    }

    renderRankingTemplate() {
        const d = this.stateManager.data.ranking;
        const w = this.renderer.canvas.width;
        const h = this.renderer.canvas.height;
        const font = this.currentState.font;
        const ctx = this.renderer.ctx;

        const gradient = ctx.createLinearGradient(0, 0, w, h); gradient.addColorStop(0, d.color1); gradient.addColorStop(1, d.color2);
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);

        this.renderer.drawPattern(w, h, this.currentState.pattern);

        ctx.fillStyle = 'white'; ctx.font = `bold 80px ${font}, sans-serif`; ctx.textAlign = 'center';
        this.renderer.applyTextEffect(d.title, w/2, 150, this.currentState.effectIntensity, this.currentState.effect);

        ctx.font = `600 32px ${font}, sans-serif`; ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.renderer.applyTextEffect(d.competition, w/2, 210, this.currentState.effectIntensity, this.currentState.effect);

        ctx.fillStyle = 'rgba(255,255,255,0.95)'; this.renderer.roundRect(80, 280, w - 160, h - 380, 30); ctx.fill();

        const teams = d.teams.split('\n').filter(t => t.trim());
        ctx.fillStyle = '#1f2937'; ctx.font = `600 ${d.textSize}px ${font}, sans-serif`; ctx.textAlign = 'left';
        teams.forEach((team, i) => {
            const y = 360 + i * (d.textSize + 20);
            this.renderer.applyTextEffect(team, 140, y, this.currentState.effectIntensity, this.currentState.effect);
        });
    }

    renderUpNextTemplate() {
        const d = this.stateManager.data.upnext;
        const w = this.renderer.canvas.width;
        const h = this.renderer.canvas.height;
        const font = this.currentState.font;
        const ctx = this.renderer.ctx;

        // Fond rouge
        ctx.fillStyle = d.colorHeader;
        ctx.fillRect(0, 0, w, h);

        // Bandeau répétitif en haut
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, 0, w, 50);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = `bold 16px ${font}, sans-serif`;
        ctx.textAlign = 'left';
        const bannerText = 'NEXT FIXTURE '.repeat(20);
        ctx.fillText(bannerText, 0, 32);

        // Logo UP NEXT
        ctx.fillStyle = '#000000';
        ctx.font = `900 120px ${font}, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText('UP', 80, 200);
        ctx.fillText('NEXT', 80, 310);

        // Flèches blanches
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `900 100px ${font}, sans-serif`;
        ctx.fillText('»', 400, 265);

        // Panneau blanc pour les matchs
        const panelY = 380;
        const panelHeight = Math.min(h - panelY - 80, d.numMatches * 150 + 40);
        ctx.fillStyle = d.colorPanel;
        this.renderer.roundRect(60, panelY, w - 120, panelHeight, 20);
        ctx.fill();

        // Dessiner les matchs
        const matchHeight = 120;
        const matchSpacing = 20;
        const startY = panelY + 40;

        for (let i = 0; i < d.numMatches; i++) {
            const match = d.matches[i];
            const y = startY + i * (matchHeight + matchSpacing);

            // Logos
            if (match.homeLogo) {
                const img = new Image();
                img.src = match.homeLogo;
                img.onload = () => { ctx.drawImage(img, 120, y, 80, 80); this.renderer.applyImageFilter(this.currentState.filter); };
            } else {
                // Shield placeholder
                ctx.fillStyle = d.colorHeader;
                ctx.beginPath();
                ctx.moveTo(160, y);
                ctx.lineTo(200, y);
                ctx.lineTo(200, y + 60);
                ctx.lineTo(180, y + 80);
                ctx.lineTo(160, y + 60);
                ctx.closePath();
                ctx.fill();
            }

            if (match.awayLogo) {
                const img = new Image();
                img.src = match.awayLogo;
                img.onload = () => { ctx.drawImage(img, w - 200, y, 80, 80); this.renderer.applyImageFilter(this.currentState.filter); };
            } else {
                // Shield placeholder
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.moveTo(w - 200, y);
                ctx.lineTo(w - 160, y);
                ctx.lineTo(w - 160, y + 60);
                ctx.lineTo(w - 180, y + 80);
                ctx.lineTo(w - 200, y + 60);
                ctx.closePath();
                ctx.fill();
            }

            // Textes centraux
            ctx.fillStyle = d.colorText;
            ctx.textAlign = 'center';
            ctx.font = `bold 32px ${font}, sans-serif`;
            ctx.fillText(match.date, w/2, y + 25);
            ctx.font = `bold 36px ${font}, sans-serif`;
            ctx.fillText(match.time, w/2, y + 60);
            ctx.font = `600 20px ${font}, sans-serif`;
            ctx.fillStyle = 'rgba(31, 41, 55, 0.6)';
            ctx.fillText(match.stadium, w/2, y + 85);

            // Ligne de séparation (sauf pour le dernier match)
            if (i < d.numMatches - 1) {
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(120, y + matchHeight);
                ctx.lineTo(w - 120, y + matchHeight);
                ctx.stroke();
            }
        }
    }

    saveToHistory() {
        const state = {
            data: this.stateManager.data,
            ...this.currentState
        };
        const canUndoRedo = this.stateManager.pushHistory(state);
        this.uiManager.updateUndoRedoButtons(canUndoRedo.undo, canUndoRedo.redo);
    }

    handleUndo() {
        const state = this.stateManager.undo();
        if (state) {
            this.restoreState(state);
        }
    }

    handleRedo() {
        const state = this.stateManager.redo();
        if (state) {
            this.restoreState(state);
        }
    }

    restoreState(state) {
        this.stateManager.data = state.data;
        this.currentState = {
            template: state.template,
            format: state.format,
            font: state.font,
            pattern: state.pattern || 'none',
            effect: state.effect || 'none',
            effectIntensity: state.effectIntensity || 5,
            filter: state.filter || 'none',
            club: state.club || 'custom',
            season: state.season || 'none',
            zoom: state.zoom || 1
        };

        this.uiManager.updateUIFromState(this.currentState);
        this.renderForm();
        this.updateFormatInfo();
        this.render();
        const canUndoRedo = this.stateManager.canUndoRedo();
        this.uiManager.updateUndoRedoButtons(canUndoRedo.undo, canUndoRedo.redo);
    }

    handleDownload() {
        const link = document.createElement('a');
        link.download = `sportvisual-${this.currentState.template}-${this.currentState.format}-${Date.now()}.png`;
        link.href = this.renderer.getImageDataURL();
        link.click();
    }

    handleShare(platform) {
        if (platform === 'copy') {
             this.copyImageLink();
        } else if (platform === 'whatsapp') {
             this.handleDownload();
             this.uiManager.showNotification('📱 Image téléchargée ! Partagez-la sur WhatsApp');
             setTimeout(() => window.open(`https://wa.me/?text=${encodeURIComponent('Découvrez mon visuel créé avec SportVisual Lite !')}`, '_blank'), 500);
        } else if (platform === 'email') {
            const d = this.stateManager.data[this.currentState.template];
            let subject = `Mon visuel SportVisual - ${this.currentState.template}`, body = `Bonjour,\n\nJe partage avec vous mon visuel créé avec SportVisual Lite.\n\n`;
            if (this.currentState.template === 'match') body += `Match: ${d.homeTeam} vs ${d.awayTeam}\nDate: ${d.date} à ${d.time}\nLieu: ${d.stadium}\n`;
            else if (this.currentState.template === 'score') body += `Score: ${d.homeTeam} ${d.homeScore} - ${d.awayScore} ${d.awayTeam}\nCompétition: ${d.competition}\n`;
            body += `\nL'image est en pièce jointe.\n\nCréé avec SportVisual Lite`;
            this.handleDownload();
            this.uiManager.showNotification('✉️ Image téléchargée ! Ajoutez-la à votre email');
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        } else if (platform === 'twitter') {
            const d = this.stateManager.data[this.currentState.template];
            let text = '';
            if (this.currentState.template === 'match') text = `🔥 ${d.homeTeam} vs ${d.awayTeam}\n📅 ${d.date} à ${d.time}\n🏟️ ${d.stadium}`;
            else if (this.currentState.template === 'score') text = `⚽ Score final: ${d.homeTeam} ${d.homeScore} - ${d.awayScore} ${d.awayTeam}\n🏆 ${d.competition}`;
            else if (this.currentState.template === 'player') text = `⭐ Joueur du match: ${d.playerName} (#${d.number})\n${d.stats}`;
            text += '\n\nCréé avec SportVisual Lite';
            this.handleDownload();
            this.uiManager.showNotification('🐦 Image téléchargée ! Uploadez-la sur Twitter');
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
        } else if (platform === 'facebook') {
            this.handleDownload();
            this.uiManager.showNotification('f Image téléchargée ! Partagez-la sur Facebook');
            window.open('https://www.facebook.com/', '_blank');
        }
    }

    async copyImageLink() {
        try {
            const blob = await new Promise(resolve => this.renderer.getCanvas().toBlob(resolve, 'image/png'));
            if (navigator.clipboard && navigator.clipboard.write) {
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]);
                this.uiManager.showNotification('✅ Image copiée dans le presse-papiers !');
            } else {
                this.handleDownload();
                this.uiManager.showNotification('🔗 Image téléchargée !');
            }
        } catch (err) {
            this.handleDownload();
            this.uiManager.showNotification('🔗 Image téléchargée !');
        }
    }

    handleSaveTemplate() {
        const name = prompt('Nom du template :', `${this.currentState.template}-${Date.now()}`);
        if (!name) return;
        const templates = this.getSavedTemplates();
        templates.unshift({
            name,
            date: new Date().toLocaleString('fr-FR'),
            data: this.stateManager.data,
            ...this.currentState
        });
        if (templates.length > 10) templates.pop();
        localStorage.setItem('sportvisual_templates', JSON.stringify(templates));
        this.uiManager.renderSavedTemplates(templates, (index) => this.loadTemplate(index), (index) => this.deleteTemplate(index));
        this.uiManager.showNotification('✅ Template sauvegardé !');
    }

    getSavedTemplates() {
        return JSON.parse(localStorage.getItem('sportvisual_templates') || '[]');
    }

    loadTemplate(index) {
        const templates = this.getSavedTemplates();
        const template = templates[index];
        if (template) {
            // Restore state except history related things? Or push to history?
            // Let's push to history effectively
            this.restoreState(template);
            this.saveToHistory();
        }
    }

    deleteTemplate(index) {
        if (!confirm('Supprimer ce template ?')) return;
        const templates = this.getSavedTemplates();
        templates.splice(index, 1);
        localStorage.setItem('sportvisual_templates', JSON.stringify(templates));
        this.uiManager.renderSavedTemplates(templates, (idx) => this.loadTemplate(idx), (idx) => this.deleteTemplate(idx));
    }

    handleReset() {
        if (confirm('Réinitialiser toutes les données ?')) {
            this.stateManager.reset();
            location.reload();
        }
    }

    handleZoom(delta) {
        this.currentState.zoom = Math.max(0.5, Math.min(2, this.currentState.zoom + delta));
        this.uiManager.updateZoom(this.currentState.zoom);
    }

    handleZoomReset() {
        this.currentState.zoom = 1;
        this.uiManager.updateZoom(this.currentState.zoom);
    }
}

new SportVisualApp();
