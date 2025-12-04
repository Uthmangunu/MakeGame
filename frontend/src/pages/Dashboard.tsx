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

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
                <div>
                    <h1 style={{ margin: 0, background: 'linear-gradient(to right, #646cff, #42b883)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        StoryMode Engine
                    </h1>
                    <p style={{ marginTop: '10px', color: '#888' }}>Turn your stories into playable games.</p>
                </div>
                <div>
                    {user ? (
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold' }}>{user.displayName}</span>
                            <button onClick={signOut}>Sign Out</button>
                        </div>
                    ) : (
                        <button className="btn-primary" onClick={signInWithGoogle}>Sign In with Google</button>
                    )}
                </div>
            </header>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8em' }}>Your Games</h2>
                    <button className="btn-primary" onClick={() => navigate('/create')}>
                        + Create New Game
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                    {games.map(game => (
                        <div key={game.gameId} className="card">
                            <h3 style={{ marginTop: 0 }}>{game.title}</h3>
                            <p style={{ color: '#aaa', fontSize: '0.9em', lineHeight: '1.6', minHeight: '60px' }}>
                                {game.summary.length > 100 ? game.summary.substring(0, 100) + '...' : game.summary}
                            </p>
                            <div style={{ marginTop: '20px' }}>
                                <button
                                    className="btn-success"
                                    onClick={() => navigate(`/play/${game.gameId}`)}
                                    style={{ width: '100%' }}
                                >
                                    Play
                                </button>
                            </div>
                        </div>
                    ))}
                    {games.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', border: '2px dashed #333', borderRadius: '8px' }}>
                            <p style={{ color: '#666' }}>No games found.</p>
                            <button className="btn-primary" onClick={() => navigate('/create')} style={{ marginTop: '10px' }}>
                                Create your first game
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
