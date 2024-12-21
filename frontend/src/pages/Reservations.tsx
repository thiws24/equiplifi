import React from "react"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { ConfirmReservationsList } from "../components/ConfirmReservationsList"
import { UserReservationsList } from "../components/UserReservationsList"

function Reservations() {
    const { userInfo } = useKeycloak()

    const isInventoryManager = userInfo?.groups?.includes("Inventory-Manager")

    if (isInventoryManager) {
        return (
            <ConfirmReservationsList />
        )
    }

    return <UserReservationsList />
}

export default Reservations
