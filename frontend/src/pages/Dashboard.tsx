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

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1>StoryMode Engine</h1>
                <div>
                    {user ? (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span>{user.displayName}</span>
                            <button onClick={signOut}>Sign Out</button>
                        </div>
                    ) : (
                        <button onClick={signInWithGoogle}>Sign In with Google</button>
                    )}
                </div>
            </header>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Your Games</h2>
                    <button onClick={() => navigate('/create')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        + Create New Game
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {games.map(game => (
                        <div key={game.gameId} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: '#2a2a2a', color: 'white' }}>
                            <h3>{game.title}</h3>
                            <p style={{ color: '#aaa', fontSize: '0.9em' }}>{game.summary}</p>
                            <div style={{ marginTop: '15px' }}>
                                <button
                                    onClick={() => navigate(`/play/${game.gameId}`)}
                                    style={{ width: '100%', padding: '8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Play
                                </button>
                            </div>
                        </div>
                    ))}
                    {games.length === 0 && <p>No games found. Create one!</p>}
                </div>
            </section>
        </div>
    );
};
