import { Routes, Route } from "react-router-dom"
import Detail from "./pages/Detail"
import Lend from "./pages/Lend"
import LendCategory from "./pages/LendCategory"
import CategoryDetails from "./pages/CategoryDetails"
import React from "react"
import Home from "./pages/Home"

const App = () => {
    return (
        <div className="bg-customBeige">
            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/item/:id" element={<Detail />} />
                <Route path="/category/:id" element={<CategoryDetails />} />

                <Route path="/item/:id/reservation" element={<Lend />} />
                <Route
                    path="/category/:id/reservation"
                    element={<LendCategory />}
                />
            </Routes>
        </div>
    )
}

export default App
