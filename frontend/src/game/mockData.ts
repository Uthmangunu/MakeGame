import type { Level } from '../../../shared/types';

export const MOCK_LEVEL: Level = {
    levelId: 'test_level_1',
    levelName: 'Debug Room',
    theme: 'basic',
    width: 10,
    height: 10,
    // 0: floor, 1: wall, 2: player_spawn
    map: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    tileset: {
        0: { type: 'floor', label: 'Floor' },
        1: { type: 'wall', label: 'Wall' },
        2: { type: 'spawn', label: 'Start' },
    },
    spawnPoints: {
        'start': { x: 1, y: 1 }
    },
    defaultSpawnPointId: 'start',
    interactions: {}
};
