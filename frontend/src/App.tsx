import { Routes, Route } from "react-router-dom"
import Detail from "./pages/Detail"
import Lend from "./pages/Lend"
import LendCategory from "./pages/LendCategory"
import CategoryCreation from "./pages/CategoryCreation"
import CategoryDetails from "./pages/CategoryDetails"
import React from "react"
import Home from "./pages/Home"
import Reservations from "./pages/Reservations"
import NoPage from "./pages/NoPage"

const App = () => {
    return (
        <div className="bg-customBeige">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/item/:id" element={<Detail />} />
                <Route path="/category/:id" element={<CategoryDetails />} />
                <Route path="/category/create" element={<CategoryCreation />} />
                <Route path="/item/:id/reservation" element={<Lend />} />
                <Route
                    path="/category/:id/reservation"
                    element={<LendCategory />}
                />
                <Route path="/reservations" element={<Reservations />} />

                <Route path="*" element={<NoPage />} />
            </Routes>
        </div>
    )
}

export default App
