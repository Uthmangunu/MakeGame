import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { config } from '../game/phaserConfig';
import { gameState } from '../game/gameState';
import { getGameMeta, getLevel } from '../services/gameService';
import type { Inventory } from '@shared/types';

interface GameCanvasProps {
    gameId?: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameId }) => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const [dialog, setDialog] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [inventory, setInventory] = React.useState<Inventory>({ items: {} });
    const [showInventory, setShowInventory] = React.useState(false);
    const [notification, setNotification] = React.useState<string | null>(null);
    const [showTutorial, setShowTutorial] = React.useState(true);

    // Store game metadata for sprite loading
    const [gameMeta, setGameMeta] = React.useState<any>(null);

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

                // Store metadata for sprite URLs
                setGameMeta(meta);

                // Load start level
                const startLevel = await getLevel(gameId, meta.startLevelId);

                // Init state
                gameState.init(meta, { [meta.startLevelId]: startLevel });

                // Try to load saved game
                const hasSave = gameState.loadFromLocalStorage(gameId);
                if (hasSave) {
                    console.log('Loaded saved game progress');
                    // Load the saved level if different from start
                    const currentLevelId = gameState.getCurrentLevel()?.levelId;
                    if (currentLevelId && currentLevelId !== meta.startLevelId) {
                        const savedLevel = await getLevel(gameId, currentLevelId);
                        gameState.addLevel(savedLevel);
                    }
                    // Update inventory display
                    setInventory(gameState.getInventory());
                }

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
        if (loading || error || !gameMeta) return;

        if (!gameRef.current) {
            gameRef.current = new Phaser.Game(config);

            // Pass sprite URLs to GameScene
            const sceneData = {
                heroSpriteUrl: gameMeta.assets?.heroUrl,
                villainSpriteUrl: gameMeta.assets?.villainUrl
            };

            // Restart the scene with sprite data
            gameRef.current.scene.getScene('GameScene')?.scene.restart(sceneData);

            gameRef.current.events.on('interaction', (data: { message: string }) => {
                setDialog(data.message);
            });

            gameRef.current.events.on('itemReceived', (data: { itemId: string }) => {
                // Update inventory display
                setInventory(gameState.getInventory());
                // Show notification
                setNotification(`Item received: ${data.itemId}`);
                setTimeout(() => setNotification(null), 3000);
            });

            gameRef.current.events.on('switchLevel', async (data: { targetLevelId: string, targetSpawnPointId: string }) => {
                console.log("Switching level to:", data.targetLevelId);

                // 1. Update State
                gameState.switchLevel(data.targetLevelId);

                // 2. Auto-save on level transition
                gameState.saveToLocalStorage();

                // 3. Load new level data (async)
                try {
                    if (gameId) {
                        const level = await getLevel(gameId, data.targetLevelId);
                        gameState.addLevel(level);
                    }

                    // 4. Restart Scene
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

    // Add keyboard listener for inventory toggle
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'i' || e.key === 'I') {
                setShowInventory(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

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
                <p>I = INVENTORY</p>
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

            {/* Inventory UI */}
            {showInventory && (
                <div className="neo-dialog" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    maxWidth: '500px',
                    maxHeight: '70vh',
                    overflow: 'auto'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>INVENTORY</h2>
                        <button
                            className="neo-btn"
                            onClick={() => setShowInventory(false)}
                            style={{ padding: '6px 12px', fontSize: '0.6rem' }}
                        >
                            [X]
                        </button>
                    </div>

                    {Object.keys(inventory.items).length === 0 ? (
                        <p style={{ textAlign: 'center', opacity: 0.6 }}>Your inventory is empty</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {Object.entries(inventory.items).map(([itemId, itemData]) => (
                                <div
                                    key={itemId}
                                    style={{
                                        padding: '10px',
                                        backgroundColor: 'rgba(255, 215, 61, 0.1)',
                                        border: '2px solid var(--primary-accent)',
                                        borderRadius: '0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: 'var(--primary-accent)' }}>{itemId}</div>
                                        {itemData.definition && (
                                            <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '4px' }}>
                                                {itemData.definition.description}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        padding: '4px 8px',
                                        backgroundColor: 'var(--primary-accent)',
                                        color: '#000'
                                    }}>
                                        x{itemData.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Notification */}
            {notification && (
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    right: '20px',
                    backgroundColor: 'var(--success-color)',
                    color: '#000',
                    padding: '12px 20px',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.7rem',
                    border: '3px solid #000',
                    boxShadow: '6px 6px 0px #000',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    {notification}
                </div>
            )}

            {/* Tutorial Overlay */}
            {showTutorial && !loading && !error && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="neo-card" style={{
                        maxWidth: '600px',
                        padding: '40px',
                        backgroundColor: 'white'
                    }}>
                        <h2 style={{
                            marginTop: 0,
                            fontFamily: 'var(--font-display)',
                            color: 'var(--primary-accent)',
                            fontSize: '1.2rem',
                            marginBottom: '20px'
                        }}>
                            🎮 WELCOME_TO_YOUR_GAME!
                        </h2>

                        <div style={{ marginBottom: '30px', lineHeight: '1.8', fontSize: '1rem' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem' }}>HOW_TO_PLAY:</strong>
                            </div>

                            <div style={{ display: 'grid', gap: '12px', marginLeft: '10px' }}>
                                <div>
                                    <strong style={{ color: 'var(--primary-accent)' }}>🎯 Movement:</strong> Use <strong>WASD</strong> or <strong>Arrow Keys</strong> to move your character
                                </div>
                                <div>
                                    <strong style={{ color: 'var(--primary-accent)' }}>💬 Interact:</strong> Press <strong>SPACE</strong> when facing NPCs (red) or items (gold)
                                </div>
                                <div>
                                    <strong style={{ color: 'var(--primary-accent)' }}>🎒 Inventory:</strong> Press <strong>I</strong> to view your collected items
                                </div>
                                <div>
                                    <strong style={{ color: 'var(--primary-accent)' }}>💡 Tips:</strong>
                                    <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
                                        <li>A <strong style={{ color: '#00D1FF' }}>cyan outline</strong> shows interactable objects</li>
                                        <li>A <strong style={{ color: '#00ff00' }}>green arrow</strong> shows which direction you're facing</li>
                                        <li>Your progress auto-saves automatically!</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <button
                            className="neo-btn neo-btn-primary"
                            onClick={() => setShowTutorial(false)}
                            style={{ width: '100%', padding: '15px', fontSize: '0.9rem' }}
                        >
                            START_PLAYING &gt;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
