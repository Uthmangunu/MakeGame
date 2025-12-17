import React, { useEffect, useState } from 'react';
import { getGameMeta, getLevel } from '../services/gameService';
import { DEMO_MODE } from '../firebase';

export const DebugGame: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [gameData, setGameData] = useState<any>(null);

    const addLog = (message: string) => {
        console.log(message);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    useEffect(() => {
        const testGame = async () => {
            addLog('🔍 Starting diagnostic...');
            addLog(`DEMO_MODE: ${DEMO_MODE}`);

            try {
                addLog('📦 Testing getGameMeta("mock_game_1")...');
                const meta = await getGameMeta('mock_game_1');
                addLog(`✅ Meta loaded: ${JSON.stringify(meta)}`);

                if (meta) {
                    addLog(`📦 Testing getLevel("mock_game_1", "${meta.startLevelId}")...`);
                    const level = await getLevel('mock_game_1', meta.startLevelId);
                    addLog(`✅ Level loaded: ${level.levelName}`);
                    addLog(`   - Width: ${level.width}, Height: ${level.height}`);
                    addLog(`   - Tileset keys: ${Object.keys(level.tileset).join(', ')}`);
                    addLog(`   - Interactions: ${Object.keys(level.interactions).length} defined`);
                    addLog(`   - Spawn points: ${Object.keys(level.spawnPoints).join(', ')}`);

                    setGameData({ meta, level });
                    addLog('✅ All data loaded successfully!');
                } else {
                    addLog('❌ Meta is null');
                }
            } catch (error) {
                addLog(`❌ ERROR: ${error}`);
            }
        };

        testGame();
    }, []);

    return (
        <div style={{ padding: '40px', fontFamily: 'monospace', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '30px' }}>🔧 Game System Diagnostic</h1>

            <div style={{
                backgroundColor: '#f0f0f0',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '30px'
            }}>
                <h2>System Status:</h2>
                <ul>
                    <li>Server: <strong style={{ color: 'green' }}>✓ RUNNING</strong></li>
                    <li>Demo Mode: <strong style={{ color: DEMO_MODE ? 'blue' : 'red' }}>{DEMO_MODE ? 'ENABLED' : 'DISABLED'}</strong></li>
                    <li>Phaser: <strong>{typeof window !== 'undefined' && (window as any).Phaser ? '✓ LOADED' : '✗ NOT LOADED'}</strong></li>
                </ul>
            </div>

            <div style={{
                backgroundColor: '#000',
                color: '#0f0',
                padding: '20px',
                borderRadius: '8px',
                maxHeight: '400px',
                overflow: 'auto',
                marginBottom: '30px'
            }}>
                <h3 style={{ color: '#0f0', marginTop: 0 }}>Console Logs:</h3>
                {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>

            {gameData && (
                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    border: '2px solid #ccc',
                    borderRadius: '8px'
                }}>
                    <h3>Loaded Game Data:</h3>
                    <pre style={{ overflow: 'auto', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
                        {JSON.stringify(gameData, null, 2)}
                    </pre>
                </div>
            )}

            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <a href="/play/mock_game_1" style={{
                    display: 'inline-block',
                    padding: '15px 30px',
                    backgroundColor: '#FF5C00',
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    borderRadius: '4px'
                }}>
                    TRY PLAYING THE GAME →
                </a>
            </div>
        </div>
    );
};
