import type { Level, GameMeta } from '@shared/types';

export interface GameState {
    gameId: string;
    currentLevelId: string;
    flags: { [key: string]: boolean };
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
            flags: {}
        };
    }

    public init(meta: GameMeta, levels: { [levelId: string]: Level }) {
        this.levels = levels;
        this.state = {
            gameId: meta.gameId,
            currentLevelId: meta.startLevelId,
            flags: { ...(meta.initialFlags || {}) }
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
            flags: {}
        };
    }
}

export const gameState = new GameStateManager();
