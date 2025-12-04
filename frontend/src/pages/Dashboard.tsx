import React, { useEffect, useState } from 'react';
import { useAuth, signInWithGoogle, signOut } from '../services/auth';
import { getUserGames } from '../services/gameService';
import type { GameMeta } from '@shared/types';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const { user, loading } = useAuth();
    const [games, setGames] = useState<GameMeta[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            getUserGames(user.uid).then(setGames);
        } else {
            // Show mock games even if not logged in for demo purposes?
            // Or just clear games.
            // Let's show mock games for "Guest"
            getUserGames('guest').then(setGames);
        }
    }, [user]);

    if (loading) return <div className="pixel-spinner" style={{ margin: '50px auto' }}></div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px', borderBottom: '3px solid black', paddingBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--accent-primary)', textShadow: '3px 3px 0px #000' }}>
                        STORYMODE<br />ENGINE
                    </h1>
                    <p style={{ marginTop: '10px', fontFamily: 'var(--font-body)', fontWeight: 'bold' }}>// TURN_STORIES_INTO_GAMES</p>
                </div>
                <div>
                    {user ? (
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem' }}>USER: {user.displayName}</span>
                            <button className="neo-btn" onClick={signOut}>LOGOUT</button>
                        </div>
                    ) : (
                        <button className="neo-btn neo-btn-primary" onClick={signInWithGoogle}>LOGIN_WITH_GOOGLE</button>
                    )}
                </div>
            </header>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2>YOUR_GAMES_DB</h2>
                    <button className="neo-btn neo-btn-primary" onClick={() => navigate('/create')}>
                        + NEW_GAME
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                    {games.map(game => (
                        <div key={game.gameId} className="neo-card">
                            <h3 style={{ marginTop: 0, fontSize: '1rem' }}>{game.title}</h3>
                            <p style={{ color: '#555', fontSize: '0.9em', lineHeight: '1.6', minHeight: '60px', borderTop: '2px solid #eee', paddingTop: '10px' }}>
                                {game.summary.length > 100 ? game.summary.substring(0, 100) + '...' : game.summary}
                            </p>
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    className="neo-btn neo-btn-success"
                                    onClick={() => navigate(`/play/${game.gameId}`)}
                                >
                                    PLAY &gt;
                                </button>
                            </div>
                        </div>
                    ))}
                    {games.length === 0 && (
                        <div className="neo-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', borderStyle: 'dashed' }}>
                            <p style={{ color: '#666', marginBottom: '20px' }}>NO_GAMES_FOUND_IN_DATABASE</p>
                            <button className="neo-btn neo-btn-primary" onClick={() => navigate('/create')}>
                                INITIALIZE_FIRST_GAME
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
