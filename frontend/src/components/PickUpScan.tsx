import * as React from "react"
import CustomToasts from "./CustomToasts"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { ProcessDataValueProps } from "../interfaces/ProcessDataValueProps"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { ItemScan } from "./ItemScan"
import { fetchDataObjectFromProcess } from "../services/fetchDataObject"

interface Props {
    processId: number
    isModalOpen: boolean
    setIsModalOpen: (isOpen: boolean) => void
}

export const PickUpScan: React.FC<Props> = ({ processId, isModalOpen, setIsModalOpen }) => {
    const [data, setData] = React.useState<ProcessDataValueProps[]>()
    const { token } = useKeycloak()

    async function getUpdatedData() {
        const dataRes = await fetchDataObjectFromProcess(processId, token ?? "", 'activereservations')
        if (dataRes) setData(dataRes)
    }

    React.useEffect(() => {
        void getUpdatedData()
    }, [])

    async function confirmLendingByReservation(reservationId: number): Promise<boolean> {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_SPIFF}/api/v1.0/messages/Check_out_inventoryitem_2`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        reservation_id: reservationId,
                        user_lending_confirmation: "confirmed"
                    })
                }
            )
            if (response.ok) {
                return true
            } else {
                CustomToasts.error({
                    message: "Es ist ein Fehler aufgetreten."
                })
            }
        } catch (e) {
            CustomToasts.error({
                message: "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut."
            })
        }
        return false
    }
    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Items abholen</DialogTitle>
                    <DialogDescription>
                        Versichern Sie sich, dass die richtigen Items mitgenommen werden, in dem Sie jedes Item scannen
                    </DialogDescription>
                </DialogHeader>
                {data?.map((item, index) => (
                    <ItemScan
                        key={item.itemId}
                        itemId={item.itemId}
                        reservationId={item.id}
                        itemStatus={item.lendingStatus}
                        confirmLending={confirmLendingByReservation}
                    />
                ))}
                <DialogFooter>
                    <Button
                        className="bg-customOrange text-white hover:bg-customRed"
                        onClick={() => setIsModalOpen(false)}
                    >
                        Abbrechen
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}