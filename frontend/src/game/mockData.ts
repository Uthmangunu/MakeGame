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
        [1, 0, 0, 4, 0, 0, 0, 0, 0, 1], // 4 is NPC
        [1, 0, 0, 1, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 1, 3, 1, 0, 0, 0, 1], // 3 is door
        [1, 0, 0, 0, 0, 0, 5, 0, 0, 1], // 5 is item
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
        4: {
            type: 'npc',
            label: 'Old Guard',
            npcId: 'guard_1'
        },
        5: {
            type: 'item',
            label: 'Ancient Key',
            itemId: 'key_ancient'
        },
    },
    spawnPoints: {
        'start': { x: 1, y: 1 },
        'from_level_2': { x: 4, y: 6 }
    },
    defaultSpawnPointId: 'start',
    interactions: {
        '4': {
            trigger: 'on_talk',
            requirementFlag: 'met_guard',
            requirementValue: false,
            dialogue: 'Halt! State your business, traveler!',
            successDialogue: 'Welcome back, brave adventurer. The path ahead is dangerous.',
            setFlag: 'met_guard'
        },
        '5': {
            trigger: 'on_use',
            message: 'You found an Ancient Key! This might unlock something important...',
            giveItemFlag: 'key_ancient',
            setFlag: 'has_ancient_key'
        }
    }
};

export const LEVEL_2: Level = {
    levelId: 'level_2',
    levelName: 'The Room',
    theme: 'dungeon',
    width: 8,
    height: 8,
    map: [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 4, 0, 0, 1], // 4 is treasure guardian NPC
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 5, 0, 0, 1], // 5 is locked chest
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
        4: {
            type: 'npc',
            label: 'Mysterious Sage',
            npcId: 'sage_1'
        },
        5: {
            type: 'item',
            label: 'Locked Chest',
            itemId: 'treasure_chest'
        },
    },
    spawnPoints: {
        'entry': { x: 1, y: 5 }
    },
    defaultSpawnPointId: 'entry',
    interactions: {
        '4': {
            trigger: 'on_talk',
            dialogue: 'Greetings, seeker. The treasure within that chest is protected by ancient magic. Only the Ancient Key can unlock it.'
        },
        '5': {
            trigger: 'on_use',
            requirementFlag: 'has_ancient_key',
            requirementValue: true,
            successDialogue: 'The Ancient Key fits perfectly! Inside the chest, you find a glowing amulet of power!',
            failureDialogue: 'The chest is locked tight. You need a key to open it.',
            setFlag: 'opened_treasure_chest',
            giveItemFlag: 'magic_amulet'
        }
    }
};

export const MOCK_GAME_META: GameMeta = {
    gameId: 'mock_game_1',
    ownerUserId: 'user_1',
    title: 'Mock Adventure',
    summary: 'A test game with dynamic sprite loading.',
    createdAt: new Date().toISOString(),
    levelOrder: ['level_1', 'level_2'],
    startLevelId: 'level_1',
    initialFlags: {},
    // Stage 1: Character definitions
    characters: [
        {
            id: 'hero_main',
            name: 'Test Hero',
            role: 'hero',
            visualDescription: 'A brave adventurer with green outfit, ready for battle',
            spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'
        },
        {
            id: 'villain_main',
            name: 'Test Villain',
            role: 'villain',
            visualDescription: 'A powerful psychic enemy with purple aura',
            spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png'
        }
    ],
    // Stage 2: Generated assets (using Pokémon sprites as placeholders)
    assets: {
        heroUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png', // Bulbasaur
        villainUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png' // Mewtwo
    },
    settingVisuals: 'Stone dungeon walls with torches'
};

export const MOCK_LEVELS = {
    'level_1': LEVEL_1,
    'level_2': LEVEL_2
};
