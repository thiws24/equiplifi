import { Routes, Route } from 'react-router-dom';
import Detail from "./Detail";
import Home from "./Home";

const App = () => {
  return (
      <div style={{ backgroundColor: '#f2e9d7'}}>
          <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/inventory-item/:id" element={<Detail/>}/>
          </Routes>
      </div>
  );
};

export default App;