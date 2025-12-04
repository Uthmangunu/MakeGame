import type { Level } from '@shared/types';

export const loadLevel = async (_levelId: string): Promise<Level> => {
    // This is now just a wrapper, or we could remove it entirely.
    // But GameCanvas uses it. Let's make it use the service but we need gameId.
    // GameCanvas has gameId.
    // Actually, let's deprecate loadLevel and use getLevel directly in GameCanvas.
    // But for now to avoid breaking changes in other files if any (GameScene doesn't use it),
    // let's just leave it as is but it's broken because it doesn't take gameId.

    // Wait, GameCanvas calls loadLevel(data.targetLevelId).
    // It doesn't pass gameId.
    // We need to update GameCanvas to call getLevel(gameId, levelId).
    // I already updated GameCanvas to call getLevel directly in the switchLevel handler.
    // So loadLevel is unused?
    // Let's check GameCanvas imports.
    return Promise.reject("Deprecated. Use getLevel(gameId, levelId)");
};
