import { Routes, Route } from 'react-router-dom'
import Detail from "./pages/Detail"
import Home from "./pages/Home"
import Lend from "./pages/Lend"

const App = () => {
  return (
      <div className='bg-customBeige'>
          <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/inventory-item/:id" element={<Detail/>}/>
              <Route path="/inventory-item/:id/reservation" element={<Lend/>}/>
          </Routes>
      </div>
  );
};

export default App;