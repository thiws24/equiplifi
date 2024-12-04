import { Routes, Route } from 'react-router-dom'
import Detail from "./pages/Detail"
import Lend from "./pages/Lend"
import React from "react";
import Home from "./pages/Home";

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