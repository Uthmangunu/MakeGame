import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../services/auth';
import { DEMO_MODE } from '../firebase';

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

        // DEMO MODE: Simulate generation and go to mock game
        if (DEMO_MODE) {
            console.log("DEMO_MODE: Simulating game generation...");
            console.log("Prompt:", prompt);

            // Fake delay to simulate AI generation
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Navigate to the mock game
            navigate('/play/mock_game_1');
            return;
        }

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
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate('/')} className="neo-btn" style={{ marginBottom: '30px' }}>
                &lt; BACK_TO_DASHBOARD
            </button>

            <h1 style={{ marginBottom: '10px', color: 'var(--accent-primary)', textShadow: '3px 3px 0px #000' }}>CREATE_NEW_GAME</h1>
            <p style={{ marginBottom: '30px', fontFamily: 'var(--font-body)', fontSize: '1.1rem' }}>
                Input your story parameters. The system will generate the game world.
            </p>

            <div className="neo-card" style={{ padding: '40px' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-display)', marginBottom: '10px', fontSize: '0.8rem' }}>STORY_PROMPT:</label>
                <textarea
                    className="neo-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., A cyberpunk hacker needs to infiltrate a corporate server room..."
                    style={{
                        height: '200px',
                        resize: 'vertical',
                        marginBottom: '20px'
                    }}
                    disabled={isGenerating}
                />

                {error && (
                    <div style={{ border: '2px solid red', padding: '10px', color: 'red', marginBottom: '20px', fontFamily: 'var(--font-display)', fontSize: '0.7rem' }}>
                        ERROR: {error}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
                    {isGenerating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="pixel-spinner"></div>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--accent-primary)' }}>GENERATING_WORLD...</span>
                        </div>
                    )}
                    <button
                        className="neo-btn neo-btn-primary"
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        style={{
                            opacity: isGenerating || !prompt.trim() ? 0.5 : 1,
                            cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isGenerating ? 'PROCESSING...' : 'GENERATE_GAME &gt;'}
                    </button>
                </div>
            </div>
        </div>
    );
};
