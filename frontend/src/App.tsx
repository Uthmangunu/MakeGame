import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { GameCanvas } from './components/GameCanvas';
import { Dashboard } from './pages/Dashboard';
import { CreateGame } from './pages/CreateGame';

const PlayGame = () => {
  const { gameId } = useParams<{ gameId: string }>();
  // Pass gameId to GameCanvas or let it read from URL?
  // GameCanvas currently inits with mock data. We need to update it to accept gameId.
  return <GameCanvas gameId={gameId} />;
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
