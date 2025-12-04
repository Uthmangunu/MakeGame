import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { GameCanvas } from './components/GameCanvas';
import { Dashboard } from './pages/Dashboard';

const PlayGame = () => {
  const { gameId } = useParams<{ gameId: string }>();
  // Pass gameId to GameCanvas or let it read from URL?
  // GameCanvas currently inits with mock data. We need to update it to accept gameId.
  return <GameCanvas gameId={gameId} />;
};

const CreateGame = () => {
  return <div style={{ color: 'white', padding: '20px' }}>Creator UI coming soon... <a href="/" style={{ color: '#007bff' }}>Back</a></div>;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/play/:gameId" element={<PlayGame />} />
          <Route path="/create" element={<CreateGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
