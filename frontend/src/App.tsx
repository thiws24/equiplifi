import { Routes, Route } from 'react-router-dom'
import Detail from "./pages/Detail"
import Home from "./pages/Home"
import Lent from "./pages/Lent"

const App = () => {
  return (
      <div className='bg-customBeige'>
          <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/inventory-item/:id" element={<Detail/>}/>
              <Route path="/inventory-item/:id/reservation" element={<Lent/>}/>
          </Routes>
      </div>
  );
};

export default App;