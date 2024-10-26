import { Routes, Route } from 'react-router-dom';
import Detail from "./Detail";
import Home from "./Home";

const App = () => {
  return (
      <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventory-item/:id" element={<Detail />} />
          </Routes>
      </>
  );
};

export default App;