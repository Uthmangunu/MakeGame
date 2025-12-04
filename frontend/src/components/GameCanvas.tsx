import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { config } from '../game/phaserConfig';
import { gameState } from '../game/gameState';
import { getGameMeta, getLevel } from '../services/gameService';
interface GameCanvasProps {
    gameId?: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameId }) => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const [dialog, setDialog] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Initialize game state on mount
    useEffect(() => {
        const initGame = async () => {
            if (!gameId) {
                setError("No game ID provided");
                setLoading(false);
                return;
            }

            try {
                const meta = await getGameMeta(gameId);
                if (!meta) {
                    setError("Game not found");
                    setLoading(false);
                    return;
                }

                // Load start level
                const startLevel = await getLevel(gameId, meta.startLevelId);

                // Init state
                gameState.init(meta, { [meta.startLevelId]: startLevel });
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Failed to load game");
                setLoading(false);
            }
        };

        initGame();
    }, [gameId]);

    useEffect(() => {
        if (loading || error) return;

        if (!gameRef.current) {
            gameRef.current = new Phaser.Game(config);

            gameRef.current.events.on('interaction', (data: { message: string }) => {
                setDialog(data.message);
            });

            gameRef.current.events.on('switchLevel', async (data: { targetLevelId: string, targetSpawnPointId: string }) => {
                console.log("Switching level to:", data.targetLevelId);

                // 1. Update State
                gameState.switchLevel(data.targetLevelId);

                // 2. Load new level data (async)
                try {
                    // Use service to get level
                    // Note: loadLevel utility might need update or we just use getLevel directly here
                    // But levelLoader was supposed to be the utility. Let's update levelLoader to use service?
                    // Or just call getLevel here.
                    // Let's use getLevel directly for now or update loadLevel to use service.
                    // The previous loadLevel was just mock.

                    if (gameId) {
                        const level = await getLevel(gameId, data.targetLevelId);
                        gameState.addLevel(level);
                    }

                    // 3. Restart Scene
                    const scene = gameRef.current?.scene.getScene('GameScene');
                    if (scene) {
                        scene.scene.restart();
                    }
                } catch (e) {
                    console.error("Failed to load level:", e);
                }
            });
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [loading, error, gameId]);

    if (loading) return <div style={{ color: 'white' }}>Loading Game...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

    return (
        <div style={{ position: 'relative' }}>
            <div
                id="game-container"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#1a1a1a'
                }}
            />
            {dialog && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'white',
                    padding: '20px',
                    border: '2px solid black',
                    borderRadius: '8px',
                    width: '80%',
                    maxWidth: '600px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <p>{dialog}</p>
                    <button onClick={() => setDialog(null)}>Close</button>
                </div>
            )}
        </div>
    );
};
