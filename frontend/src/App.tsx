import { Routes, Route } from 'react-router-dom'
import Detail from "./Detail"
import Home from "./Home"
import Rent from "./Rent"

const App = () => {
  return (
      <div className='bg-customBeige'>
          <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/inventory-item/:id" element={<Detail/>}/>
              <Route path="/inventory-item/:id/reservation" element={<Rent/>}/>
          </Routes>
      </div>
  );
};

export default App;