import * as React from "react"
import CustomToasts from "./CustomToasts"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { ProcessDataValueProps } from "../interfaces/ProcessDataValueProps"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { ItemScan } from "./ItemScan"
import { fetchDataObjectFromProcess } from "../services/fetchDataObject"
import { map } from "lodash"

interface Props {
    processId: number
    isModalOpen: boolean
    setIsModalOpen: (isOpen: boolean) => void
    data?: ProcessDataValueProps[]
}

export const PickUpScan: React.FC<Props> = ({ processId, isModalOpen, setIsModalOpen, data }) => {
    const [alreadyScannedIds, setAlreadyScannedIds] = React.useState<number[]>()
    const { token } = useKeycloak()

    async function getUpdatedData() {
        const dataRes: ProcessDataValueProps[] | undefined = await fetchDataObjectFromProcess(processId, token ?? "", 'activereservations')
        if (dataRes) setAlreadyScannedIds(map(dataRes, 'itemId'))
    }

    React.useEffect(() => {
        void getUpdatedData()
    }, [])

    async function confirmLendingByReservation(reservationId: number): Promise<boolean> {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_SPIFF}/api/v1.0/messages/Check_out_inventoryitem_12`,
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
                        alreadyScanned={Boolean(alreadyScannedIds && alreadyScannedIds.indexOf(item.id) !== -1)}
                        confirmLending={confirmLendingByReservation}
                    />
                ))}
                <DialogFooter>
                    <Button
                        className="bg-customBlue text-white hover:bg-customRed"
                        onClick={() => window.location.reload()}
                    >
                        Bestätigen
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}