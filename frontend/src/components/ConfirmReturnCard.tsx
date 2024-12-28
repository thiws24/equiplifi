import * as React from "react"
import { useState } from "react"
import { ProcessDataValueProps } from "../interfaces/ProcessDataValueProps"
import { map } from "lodash"
import { Button } from "./ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"

interface Props {
    processId: number,
    data?: ProcessDataValueProps[]
    onConfirmReturn: (reservationId: number) => Promise<void>,
}

export const ConfirmReturnCard: React.FC<Props> = ({
                                                       processId,
                                                       data,
                                                       onConfirmReturn,
                                                   }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleReturn = () => {
        setIsModalOpen(true)
    }

    const handleConfirmModal = async () => {
        try {
            await Promise.all(
                map(data, (reservation) => {
                    return onConfirmReturn(reservation.id)
                })
            )

            setIsModalOpen(false)
        } catch (error) {
            console.error("Error confirming return", error)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    const itemIds: number[] = map(data, "itemId")

    return (
        <div className="space-y-5 text-sm border p-4 rounded shadow-md">
            <p>Prozess-ID: {processId}</p>
            <div>Item-IDs: {itemIds.join(", ")}</div>
            <Button
                className="bg-customBlue text-customBeige text-sm px-4 py-2 rounded hover:bg-customRed mt-4"
                onClick={handleReturn}
            >
                Rückgabe bestätigen
            </Button>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rückgabe bestätigen</DialogTitle>
                        <DialogDescription>
                            Sind Sie sicher, dass die Rückgabe erfolgreich war?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <p>Prozess-ID: {processId}</p>
                        <p>Item-IDs: {itemIds.join(", ")}</p>
                    </div>
                    <DialogFooter>
                        <Button
                            className="bg-customOrange text-white hover:bg-customRed"
                            onClick={handleCloseModal}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            className="bg-customBlue text-customBeige hover:bg-customRed"
                            onClick={handleConfirmModal}
                        >
                            Bestätigen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}