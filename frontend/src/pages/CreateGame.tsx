import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../services/auth';
import { DEMO_MODE } from '../firebase';

const STORY_TEMPLATES = [
    {
        category: "Fantasy Adventure",
        examples: [
            "A young wizard must find three ancient crystals to save their village from an evil sorcerer",
            "A brave knight searches for a legendary sword hidden in a haunted castle",
        ]
    },
    {
        category: "Sci-Fi Mystery",
        examples: [
            "A space station detective investigates strange disappearances on a mining colony",
            "A hacker must infiltrate a corporate AI to uncover the truth about their past",
        ]
    },
    {
        category: "Horror Survival",
        examples: [
            "Trapped in an abandoned asylum, find the key to escape before dawn",
            "A paranormal investigator explores a cursed mansion to break an ancient curse",
        ]
    },
    {
        category: "Puzzle Quest",
        examples: [
            "Solve riddles left by an ancient civilization to unlock a hidden treasure",
            "Navigate through a magical library where books come alive and hold secrets",
        ]
    }
];

export const CreateGame: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showTemplates, setShowTemplates] = useState(true);
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
                Describe your story idea. The AI will create a playable game with NPCs, items, and puzzles.
            </p>

            {/* Story Templates */}
            {showTemplates && (
                <div className="neo-card" style={{ padding: '30px', marginBottom: '30px', backgroundColor: '#FFF8E7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem' }}>💡 STORY_INSPIRATION</h3>
                        <button
                            className="neo-btn"
                            onClick={() => setShowTemplates(false)}
                            style={{ padding: '4px 8px', fontSize: '0.6rem' }}
                        >
                            [HIDE]
                        </button>
                    </div>
                    <p style={{ fontSize: '0.85rem', marginBottom: '20px', opacity: 0.8 }}>
                        Click any example below to use it as your starting point, or write your own unique story!
                    </p>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {STORY_TEMPLATES.map((template) => (
                            <div key={template.category}>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', marginBottom: '8px', color: 'var(--primary-accent)' }}>
                                    {template.category.toUpperCase()}:
                                </div>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {template.examples.map((example, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPrompt(example)}
                                            style={{
                                                textAlign: 'left',
                                                padding: '12px',
                                                backgroundColor: prompt === example ? 'var(--primary-accent)' : 'white',
                                                color: prompt === example ? 'white' : 'black',
                                                border: '2px solid var(--border-color)',
                                                cursor: 'pointer',
                                                fontFamily: 'var(--font-body)',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s'
                                            }}
                                            className="neo-btn"
                                        >
                                            "{example}"
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!showTemplates && (
                <button
                    className="neo-btn"
                    onClick={() => setShowTemplates(true)}
                    style={{ marginBottom: '20px', fontSize: '0.7rem' }}
                >
                    💡 SHOW_STORY_EXAMPLES
                </button>
            )}

            <div className="neo-card" style={{ padding: '40px' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-display)', marginBottom: '10px', fontSize: '0.8rem' }}>YOUR_STORY_PROMPT:</label>
                <textarea
                    className="neo-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your game story... Include characters, goals, and challenges for best results."
                    style={{
                        height: '150px',
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
