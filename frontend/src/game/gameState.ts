import type { Level, GameMeta, Inventory } from '@shared/types';

export interface GameState {
    gameId: string;
    currentLevelId: string;
    flags: { [key: string]: boolean };
    inventory: Inventory;
    // We might want to persist player position if we save mid-level,
    // but for now level transitions usually define spawn points.
}

class GameStateManager {
    private state: GameState;
    private levels: { [levelId: string]: Level } = {};

    constructor() {
        this.state = {
            gameId: '',
            currentLevelId: '',
            flags: {},
            inventory: { items: {} }
        };
    }

    public init(meta: GameMeta, levels: { [levelId: string]: Level }) {
        this.levels = levels;
        this.state = {
            gameId: meta.gameId,
            currentLevelId: meta.startLevelId,
            flags: { ...(meta.initialFlags || {}) },
            inventory: { items: {} }
        };
    }

    public addLevel(level: Level) {
        this.levels[level.levelId] = level;
    }

    public getCurrentLevel(): Level | undefined {
        return this.levels[this.state.currentLevelId];
    }

    public setFlag(flag: string, value: boolean = true) {
        this.state.flags[flag] = value;
        console.log(`Flag set: ${flag} = ${value}`);
    }

    public getFlag(flag: string): boolean {
        return !!this.state.flags[flag];
    }

    public switchLevel(levelId: string) {
        if (this.levels[levelId]) {
            this.state.currentLevelId = levelId;
            console.log(`Switched to level: ${levelId}`);
        } else {
            console.error(`Level not found: ${levelId}`);
        }
    }

    public reset() {
        this.state = {
            gameId: '',
            currentLevelId: '',
            flags: {},
            inventory: { items: {} }
        };
    }

    public addItem(itemId: string, quantity: number = 1) {
        if (this.state.inventory.items[itemId]) {
            this.state.inventory.items[itemId].quantity += quantity;
        } else {
            this.state.inventory.items[itemId] = { quantity };
        }
        console.log(`Item added: ${itemId} x${quantity}`);
    }

    public hasItem(itemId: string): boolean {
        return !!this.state.inventory.items[itemId] && this.state.inventory.items[itemId].quantity > 0;
    }

    public getInventory(): Inventory {
        return this.state.inventory;
    }

    public saveToLocalStorage() {
        const saveData = {
            gameId: this.state.gameId,
            currentLevelId: this.state.currentLevelId,
            flags: this.state.flags,
            inventory: this.state.inventory,
            timestamp: new Date().toISOString()
        };

        try {
            localStorage.setItem(`game_save_${this.state.gameId}`, JSON.stringify(saveData));
            console.log('Game saved to localStorage');
        } catch (error) {
            console.error('Failed to save game:', error);
        }
    }

    public loadFromLocalStorage(gameId: string): boolean {
        try {
            const saved = localStorage.getItem(`game_save_${gameId}`);
            if (saved) {
                const data = JSON.parse(saved);
                this.state.currentLevelId = data.currentLevelId;
                this.state.flags = data.flags || {};
                this.state.inventory = data.inventory || { items: {} };
                console.log('Game loaded from localStorage');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }

    public clearSave(gameId: string) {
        try {
            localStorage.removeItem(`game_save_${gameId}`);
            console.log('Save data cleared');
        } catch (error) {
            console.error('Failed to clear save:', error);
        }
    }
}

export const gameState = new GameStateManager();
