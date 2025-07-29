import { Routes, Route } from 'react-router-dom';
import './App.css';
import MachineList from './components/MachineList';
import MachinePage from './components/MachinePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MachineList />} />
      <Route path="/machine/:id" element={<MachinePage />} />
    </Routes>
  );
}

export default App;
