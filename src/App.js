import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MapPage from './pages/MapPage';

function App() {

  return (
    <BrowserRouter>
      <div className='App'></div>
      <Routes>
        <Route path="/map" element={<MapPage/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
