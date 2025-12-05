import { FIELD_SETS } from './constants.js';

export class UIManager {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.uiTheme = 'light';
    }

    init() {
        this.loadUITheme();
        this.setupEventListeners();
        this.setupCollapsibles();
    }

    loadUITheme() {
        const saved = localStorage.getItem('sportvisual_ui_theme');
        if (saved) this.uiTheme = saved;
        this.applyUITheme();
    }

    applyUITheme() {
        document.documentElement.setAttribute('data-theme', this.uiTheme);
        localStorage.setItem('sportvisual_ui_theme', this.uiTheme);
        // Update active class for theme buttons
        document.querySelectorAll('.theme-btn').forEach(b => {
             if (b.dataset.uiTheme === this.uiTheme) b.classList.add('active');
             else b.classList.remove('active');
        });
    }

    setupEventListeners() {
        // UI Theme
        document.querySelectorAll('[data-ui-theme]').forEach(btn => btn.addEventListener('click', (e) => {
            this.uiTheme = e.target.dataset.uiTheme;
            this.applyUITheme();
        }));

        // Club themes
        document.querySelectorAll('.club-btn').forEach(btn => btn.addEventListener('click', (e) => {
            document.querySelectorAll('.club-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            this.callbacks.onClubChange(e.target.dataset.club);
        }));

        // Season themes
        document.querySelectorAll('.season-btn').forEach(btn => btn.addEventListener('click', (e) => {
            document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            this.callbacks.onSeasonChange(e.target.dataset.season);
        }));

        // Template & Format
        document.getElementById('template-select').addEventListener('change', (e) => {
            this.callbacks.onTemplateChange(e.target.value);
        });
        document.querySelectorAll('.format-btn').forEach(btn => btn.addEventListener('click', (e) => {
            document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            this.callbacks.onFormatChange(e.target.dataset.format);
        }));

        // Font
        document.querySelectorAll('.font-option').forEach(btn => btn.addEventListener('click', (e) => {
            document.querySelectorAll('.font-option').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            this.callbacks.onFontChange(e.target.dataset.font);
        }));

        // Patterns, Effects, Filters
        document.querySelectorAll('.pattern-btn').forEach(btn => btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            this.callbacks.onPatternChange(e.target.dataset.pattern);
        }));
        document.querySelectorAll('.effect-btn').forEach(btn => btn.addEventListener('click', (e) => {
            document.querySelectorAll('.effect-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const effect = e.target.dataset.effect;
            document.getElementById('effect-intensity-field').style.display = effect !== 'none' ? 'block' : 'none';
            this.callbacks.onEffectChange(effect);
        }));
        document.getElementById('effect-intensity').addEventListener('input', (e) => {
            document.getElementById('effect-intensity-val').textContent = e.target.value;
            this.callbacks.onEffectIntensityChange(parseInt(e.target.value));
        });
        document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            this.callbacks.onFilterChange(e.target.dataset.filter);
        }));

        // Buttons
        document.getElementById('btn-download').addEventListener('click', () => this.callbacks.onDownload());
        document.getElementById('btn-share').addEventListener('click', () => this.toggleShareButtons());
        document.getElementById('share-whatsapp').addEventListener('click', () => this.callbacks.onShare('whatsapp'));
        document.getElementById('share-email').addEventListener('click', () => this.callbacks.onShare('email'));
        document.getElementById('share-twitter').addEventListener('click', () => this.callbacks.onShare('twitter'));
        document.getElementById('share-facebook').addEventListener('click', () => this.callbacks.onShare('facebook'));
        document.getElementById('share-copy').addEventListener('click', () => this.callbacks.onShare('copy'));
        document.getElementById('btn-save-template').addEventListener('click', () => this.callbacks.onSaveTemplate());
        document.getElementById('btn-reset').addEventListener('click', () => this.callbacks.onReset());
        document.getElementById('btn-undo').addEventListener('click', () => this.callbacks.onUndo());
        document.getElementById('btn-redo').addEventListener('click', () => this.callbacks.onRedo());
        document.getElementById('btn-zoom-in').addEventListener('click', () => this.callbacks.onZoom(0.1));
        document.getElementById('btn-zoom-out').addEventListener('click', () => this.callbacks.onZoom(-0.1));
        document.getElementById('btn-zoom-reset').addEventListener('click', () => this.callbacks.onZoomReset());
        document.getElementById('btn-fullscreen').addEventListener('click', () => this.toggleFullscreen());

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') { e.preventDefault(); this.callbacks.onUndo(); }
                else if (e.key === 'y' || (e.shiftKey && e.key === 'z')) { e.preventDefault(); this.callbacks.onRedo(); }
            }
        });
    }

    setupCollapsibles() {
        ['effects', 'patterns', 'filters', 'clubs', 'seasons'].forEach(section => {
            const toggle = document.getElementById(`${section}-toggle`);
            if (toggle) {
                toggle.addEventListener('click', () => {
                    const content = document.getElementById(`${section}-content`);
                    content.classList.toggle('collapsed');
                    toggle.classList.toggle('collapsed');
                });
            }
        });
    }

    renderForm(template, data, onDataChange) {
        const container = document.getElementById('form-fields');
        container.innerHTML = '';

        if (template === 'upnext') {
            this.renderUpNextForm(container, data, onDataChange);
            return;
        }

        const fields = FIELD_SETS[template];
        if (!fields) return;

        fields.forEach(field => {
            const div = document.createElement('div'); div.className = 'field';
            const label = document.createElement('label'); label.textContent = field.label; div.appendChild(label);

            if (field.type === 'color') {
                const colorDiv = document.createElement('div'); colorDiv.className = 'color-field';
                const input = document.createElement('input'); input.type = 'color'; input.value = data[field.key];
                const hex = document.createElement('div'); hex.className = 'hex-display'; hex.textContent = input.value;
                input.addEventListener('input', (e) => {
                    hex.textContent = e.target.value;
                    onDataChange(field.key, e.target.value);
                });
                colorDiv.appendChild(input); colorDiv.appendChild(hex); div.appendChild(colorDiv);
            } else if (field.type === 'range') {
                const input = document.createElement('input'); input.type = 'range'; input.min = field.min; input.max = field.max; input.value = data[field.key];
                const rangeLabel = document.createElement('div'); rangeLabel.className = 'range-label'; rangeLabel.innerHTML = `<span>${field.min}</span><span>${input.value}</span><span>${field.max}</span>`;
                input.addEventListener('input', (e) => {
                    rangeLabel.querySelector('span:nth-child(2)').textContent = e.target.value;
                    onDataChange(field.key, parseInt(e.target.value));
                });
                div.appendChild(input); div.appendChild(rangeLabel);
            } else if (field.type === 'image') {
                const uploadDiv = document.createElement('div'); uploadDiv.className = 'image-upload';
                const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.id = `upload-${field.key}`;
                const btn = document.createElement('label'); btn.className = 'image-upload-btn'; btn.htmlFor = `upload-${field.key}`;
                btn.textContent = data[field.key] ? '✓ Image chargée' : '📎 Choisir une image';
                if (data[field.key]) btn.classList.add('has-image');
                input.addEventListener('change', (e) => {
                    if (e.target.files[0]) {
                         // Handle file read in callback or here?
                         // Better to handle file reading here and pass dataURL
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                             btn.textContent = '✓ Image chargée';
                             btn.classList.add('has-image');
                             onDataChange(field.key, evt.target.result);
                        };
                        reader.readAsDataURL(e.target.files[0]);
                    }
                });
                uploadDiv.appendChild(input); uploadDiv.appendChild(btn); div.appendChild(uploadDiv);
            } else if (field.type === 'textarea') {
                const input = document.createElement('textarea'); input.value = data[field.key];
                input.addEventListener('input', (e) => { onDataChange(field.key, e.target.value); });
                div.appendChild(input);
            } else {
                const input = document.createElement('input'); input.type = field.type; input.value = data[field.key];
                input.addEventListener('input', (e) => { onDataChange(field.key, field.type === 'number' ? parseInt(e.target.value) : e.target.value); });
                div.appendChild(input);
            }
            container.appendChild(div);
        });
    }

    renderUpNextForm(container, data, onDataChange) {
        // Nombre de matchs
        const numField = document.createElement('div'); numField.className = 'field';
        const numLabel = document.createElement('label'); numLabel.textContent = 'Nombre de matchs';
        const numInput = document.createElement('input'); numInput.type = 'range'; numInput.min = 2; numInput.max = 5; numInput.value = data.numMatches;
        const numRangeLabel = document.createElement('div'); numRangeLabel.className = 'range-label';
        numRangeLabel.innerHTML = `<span>2</span><span>${data.numMatches}</span><span>5</span>`;
        numInput.addEventListener('input', (e) => {
            const newNum = parseInt(e.target.value);
            numRangeLabel.querySelector('span:nth-child(2)').textContent = newNum;
            onDataChange('numMatches', newNum);
        });
        numField.appendChild(numLabel); numField.appendChild(numInput); numField.appendChild(numRangeLabel);
        container.appendChild(numField);

        // Couleurs
        ['colorHeader', 'colorPanel', 'colorText'].forEach(colorKey => {
            const div = document.createElement('div'); div.className = 'field';
            const label = document.createElement('label');
            label.textContent = colorKey === 'colorHeader' ? 'Couleur en-tête' : colorKey === 'colorPanel' ? 'Couleur panneau' : 'Couleur texte';
            div.appendChild(label);
            const colorDiv = document.createElement('div'); colorDiv.className = 'color-field';
            const input = document.createElement('input'); input.type = 'color'; input.value = data[colorKey];
            const hex = document.createElement('div'); hex.className = 'hex-display'; hex.textContent = input.value;
            input.addEventListener('input', (e) => {
                hex.textContent = e.target.value;
                onDataChange(colorKey, e.target.value);
            });
            colorDiv.appendChild(input); colorDiv.appendChild(hex); div.appendChild(colorDiv);
            container.appendChild(div);
        });

        // Matchs
        for (let i = 0; i < data.numMatches; i++) {
            const matchGroup = document.createElement('div'); matchGroup.className = 'match-group';
            const groupTitle = document.createElement('div'); groupTitle.className = 'match-group-title';
            groupTitle.textContent = `Match ${i + 1}`;
            matchGroup.appendChild(groupTitle);

            ['homeTeam', 'awayTeam', 'date', 'time', 'stadium'].forEach(key => {
                const div = document.createElement('div'); div.className = 'field';
                const label = document.createElement('label');
                const labels = { homeTeam: 'Équipe Domicile', awayTeam: 'Équipe Extérieure', date: 'Date', time: 'Heure', stadium: 'Stade' };
                label.textContent = labels[key];
                const input = document.createElement('input'); input.type = 'text'; input.value = data.matches[i][key];
                input.addEventListener('input', (e) => {
                     // We need to pass the index and key to update nested structure
                     onDataChange('matches', { index: i, key: key, value: e.target.value });
                });
                div.appendChild(label); div.appendChild(input); matchGroup.appendChild(div);
            });

            // Logos
            ['homeLogo', 'awayLogo'].forEach(logoKey => {
                const div = document.createElement('div'); div.className = 'field';
                const label = document.createElement('label');
                label.textContent = logoKey === 'homeLogo' ? 'Logo Domicile' : 'Logo Extérieur';
                const uploadDiv = document.createElement('div'); uploadDiv.className = 'image-upload';
                const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
                input.id = `upload-${logoKey}-${i}`;
                const btn = document.createElement('label'); btn.className = 'image-upload-btn'; btn.htmlFor = `upload-${logoKey}-${i}`;
                btn.textContent = data.matches[i][logoKey] ? '✓ Logo chargé' : '📎 Choisir logo';
                if (data.matches[i][logoKey]) btn.classList.add('has-image');
                input.addEventListener('change', (e) => {
                    if (e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                             btn.textContent = '✓ Logo chargé';
                             btn.classList.add('has-image');
                             onDataChange('matches', { index: i, key: logoKey, value: evt.target.result });
                        };
                        reader.readAsDataURL(e.target.files[0]);
                    }
                });
                uploadDiv.appendChild(input); uploadDiv.appendChild(btn);
                div.appendChild(label); div.appendChild(uploadDiv);
                matchGroup.appendChild(div);
            });

            container.appendChild(matchGroup);
        }
    }

    updateUndoRedoButtons(canUndo, canRedo) {
        document.getElementById('btn-undo').disabled = !canUndo;
        document.getElementById('btn-redo').disabled = !canRedo;
    }

    updateFormatInfo(text) {
        document.getElementById('format-info').textContent = text;
    }

    toggleShareButtons() {
        const shareButtons = document.getElementById('share-buttons');
        shareButtons.style.display = shareButtons.style.display === 'none' ? 'grid' : 'none';
    }

    toggleFullscreen() {
        const preview = document.getElementById('preview');
        preview.classList.toggle('fullscreen');
        document.getElementById('btn-fullscreen').textContent = preview.classList.contains('fullscreen') ? '❌ Quitter' : '⛶ Plein écran';
    }

    updateZoom(zoom) {
        document.getElementById('preview-container').style.transform = `scale(${zoom})`;
        document.getElementById('btn-zoom-reset').textContent = `${Math.round(zoom * 100)}%`;
    }

    showNotification(message) {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    updateActiveButtons(selector, activeValue, dataAttribute) {
         document.querySelectorAll(selector).forEach(btn => {
             btn.classList.toggle('active', btn.dataset[dataAttribute] === activeValue);
         });
    }

    updateUIFromState(state) {
        document.getElementById('template-select').value = state.template;
        this.updateActiveButtons('.format-btn', state.format, 'format');
        this.updateActiveButtons('.font-option', state.font, 'font');
        this.updateActiveButtons('.pattern-btn', state.pattern, 'pattern');
        this.updateActiveButtons('.effect-btn', state.effect, 'effect');
        this.updateActiveButtons('.filter-btn', state.filter, 'filter');
        this.updateActiveButtons('.club-btn', state.club, 'club');
        this.updateActiveButtons('.season-btn', state.season, 'season');

        document.getElementById('effect-intensity').value = state.effectIntensity;
        document.getElementById('effect-intensity-val').textContent = state.effectIntensity;
        document.getElementById('effect-intensity-field').style.display = state.effect !== 'none' ? 'block' : 'none';
    }

    renderSavedTemplates(templates, onLoad, onDelete) {
        const container = document.getElementById('saved-templates');
        if (templates.length === 0) { container.innerHTML = '<div class="empty-state">Aucun template sauvegardé</div>'; return; }
        container.innerHTML = templates.map((t, i) => `<div class="template-card" data-index="${i}"><div class="template-card-name">${t.name}</div><div class="template-card-date">${t.date}</div><button class="template-card-delete" data-index="${i}">×</button></div>`).join('');
        container.querySelectorAll('.template-card').forEach(card => card.addEventListener('click', (e) => {
            if (e.target.classList.contains('template-card-delete')) return;
            onLoad(parseInt(card.dataset.index));
        }));
        container.querySelectorAll('.template-card-delete').forEach(btn => btn.addEventListener('click', (e) => {
            e.stopPropagation();
            onDelete(parseInt(btn.dataset.index));
        }));
    }
}
