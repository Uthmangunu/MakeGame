import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../services/auth';

export const CreateGame: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        if (!user) {
            setError("You must be logged in to create a game.");
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const functions = getFunctions();
            const generateGame = httpsCallable(functions, 'generateGameFromStory');

            // Note: This might timeout on standard plans (60s limit). 
            // Gemini is usually fast enough, but complex games might take time.
            const result = await generateGame({ prompt });
            const data = result.data as { gameId: string };

            navigate(`/play/${data.gameId}`);
        } catch (err) {
            console.error("Generation failed:", err);
            setError("Failed to generate game. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto', color: 'white' }}>
            <button onClick={() => navigate('/')} style={{ marginBottom: '20px', background: 'transparent', paddingLeft: 0 }}>
                &larr; Back to Dashboard
            </button>

            <h1 style={{ fontSize: '2.5em', marginBottom: '10px' }}>Create New Game</h1>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>
                Describe your game story below. Be creative! Mention the setting, the goal, and any obstacles.
            </p>

            <div className="card" style={{ padding: '30px' }}>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., A brave knight wakes up in a dark dungeon. They must find the golden key to escape, but the path is guarded by walls and locked doors..."
                    style={{
                        width: '100%',
                        height: '200px',
                        padding: '15px',
                        borderRadius: '8px',
                        backgroundColor: '#1a1a1a',
                        color: 'white',
                        border: '1px solid #444',
                        fontSize: '1.1em',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                    }}
                    disabled={isGenerating}
                />

                {error && <p style={{ color: '#ff6b6b', marginTop: '15px' }}>{error}</p>}

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
                    {isGenerating && <span style={{ color: '#646cff' }}>Generating your world... (this may take a minute)</span>}
                    <button
                        className="btn-primary"
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        style={{
                            padding: '12px 30px',
                            fontSize: '1.1em',
                            opacity: isGenerating || !prompt.trim() ? 0.5 : 1,
                            cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Game'}
                    </button>
                </div>
                {isGenerating && <div className="loading-spinner"></div>}
            </div>
        </div>
    );
};
