import React, { useEffect } from "react"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { InventoryManagerReservationsList } from "../components/InventoryManagerReservationsList"
import { UserReservationsList } from "../components/UserReservationsList"


function Reservations() {
    useEffect(() => {
        document.title = "Reservierungen | equipli"
    }, [])

    const { userInfo } = useKeycloak()

    const isInventoryManager = userInfo?.groups?.includes("Inventory-Manager")

    return (
        <div className="max-w-[1440px] mx-auto">
            <div className="m-8 lg:m-20">
                <main className="main">
                    <div className="mb-20">
                        <h1 className="text-3xl font-bold">Reservierungen</h1>
                        <p className="text-sm text-muted-foreground"></p>
                    </div>
                </main>
            </div>
            <div className="m-8">
                {isInventoryManager && <InventoryManagerReservationsList />}
                <UserReservationsList />
            </div>
        </div>
    )
}

export default Reservations
