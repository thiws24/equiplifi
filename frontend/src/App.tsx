import { Routes, Route } from 'react-router-dom'
import Detail from "./Pages/Detail"
import Home from "./Pages/Home"
import Lent from "./Pages/Lent"

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