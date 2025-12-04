import type { Level, GameMeta } from '../../../shared/types';

export const LEVEL_1: Level = {
    levelId: 'level_1',
    levelName: 'The Hall',
    theme: 'dungeon',
    width: 10,
    height: 10,
    map: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 1, 3, 1, 0, 0, 0, 1], // 3 is door
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    tileset: {
        0: { type: 'floor', label: 'Floor' },
        1: { type: 'wall', label: 'Wall' },
        2: { type: 'spawn', label: 'Start' },
        3: {
            type: 'door',
            label: 'Door to Room',
            doorTargetLevelId: 'level_2',
            doorTargetSpawnPointId: 'entry'
        },
    },
    spawnPoints: {
        'start': { x: 1, y: 1 },
        'from_level_2': { x: 4, y: 6 }
    },
    defaultSpawnPointId: 'start',
    interactions: {}
};

export const LEVEL_2: Level = {
    levelId: 'level_2',
    levelName: 'The Room',
    theme: 'dungeon',
    width: 8,
    height: 8,
    map: [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 3, 1, 1, 1, 1, 1, 1], // 3 is door back
        [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    tileset: {
        0: { type: 'floor' },
        1: { type: 'wall' },
        3: {
            type: 'door',
            label: 'Door to Hall',
            doorTargetLevelId: 'level_1',
            doorTargetSpawnPointId: 'from_level_2'
        },
    },
    spawnPoints: {
        'entry': { x: 1, y: 5 }
    },
    defaultSpawnPointId: 'entry',
    interactions: {}
};

export const MOCK_GAME_META: GameMeta = {
    gameId: 'mock_game_1',
    ownerUserId: 'user_1',
    title: 'Mock Adventure',
    summary: 'A test game.',
    createdAt: new Date().toISOString(),
    levelOrder: ['level_1', 'level_2'],
    startLevelId: 'level_1',
    initialFlags: {}
};

export const MOCK_LEVELS = {
    'level_1': LEVEL_1,
    'level_2': LEVEL_2
};
