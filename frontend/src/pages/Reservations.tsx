import React from "react"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { InventoryManagerReservationsList } from "../components/InventoryManagerReservationsList"
import { UserReservationsList } from "../components/UserReservationsList"

function Reservations() {
    const { userInfo } = useKeycloak()

    const isInventoryManager = userInfo?.groups?.includes("Inventory-Manager")

    if (isInventoryManager) {
        return (
            <InventoryManagerReservationsList />
        )
    }

    return <UserReservationsList />
}

export default Reservations
