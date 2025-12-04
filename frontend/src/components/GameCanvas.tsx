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

    if (loading) return <div className="pixel-spinner" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px', fontFamily: 'var(--font-display)' }}>ERROR: {error}</div>;

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#121212' }}>
            <div
                id="game-container"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%'
                }}
            />

            {/* Controls Help */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                color: 'rgba(255,255,255,0.7)',
                pointerEvents: 'none',
                fontFamily: 'var(--font-display)',
                fontSize: '0.7rem',
                textShadow: '2px 2px 0px #000'
            }}>
                <p>WASD / ARROWS = MOVE</p>
                <p>SPACE = INTERACT</p>
            </div>

            {/* Retro Dialog Box */}
            {dialog && (
                <div className="neo-dialog" style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    maxWidth: '600px',
                }}>
                    <p style={{ margin: 0, marginBottom: '10px' }}>{dialog}</p>
                    <div style={{ textAlign: 'right' }}>
                        <button
                            className="neo-btn"
                            onClick={() => setDialog(null)}
                            style={{ padding: '8px 16px', fontSize: '0.6rem' }}
                        >
                            [CLOSE]
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
