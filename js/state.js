export class StateManager {
    constructor() {
        this.data = {};
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 20;
    }

    init(defaultData) {
        this.data = JSON.parse(JSON.stringify(defaultData));
        this.loadFromStorage();
    }

    loadFromStorage() {
        const saved = localStorage.getItem('sportvisual_data');
        if (saved) {
            try {
                this.data = { ...this.data, ...JSON.parse(saved) };
            } catch (e) {
                console.error("Failed to load data from storage", e);
            }
        }
    }

    saveToStorage() {
        localStorage.setItem('sportvisual_data', JSON.stringify(this.data));
    }

    pushHistory(currentState) {
        const state = JSON.stringify(currentState);
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        this.history.push(state);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
        return this.canUndoRedo();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            return JSON.parse(this.history[this.historyIndex]);
        }
        return null;
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            return JSON.parse(this.history[this.historyIndex]);
        }
        return null;
    }

    canUndoRedo() {
        return {
            undo: this.historyIndex > 0,
            redo: this.historyIndex < this.history.length - 1
        };
    }

    reset() {
         localStorage.removeItem('sportvisual_data');
    }
}
