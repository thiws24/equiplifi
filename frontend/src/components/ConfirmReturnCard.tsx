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
    DialogTrigger
} from "./ui/dialog"
import { CalendarCheck } from "lucide-react"

interface Props {
    processId: number
    data?: ProcessDataValueProps[]
    onConfirmReturn: (reservationId: number) => Promise<void>
}

export const ConfirmReturnCard: React.FC<Props> = ({
    processId,
    data,
    onConfirmReturn
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
            <button
                className="w-32 bg-customOrange text-white text-sm px-4 py-2 rounded hover:bg-orange-600 flex items-center justify-self-end"
                onClick={handleReturn}
            >
                <CalendarCheck className="w-4 h-4 mr-2" />
                Bestätigen
            </button>

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
                        <button
                            className="bg-customOrange text-white hover:bg-customRed"
                            onClick={handleCloseModal}
                        >
                            Abbrechen
                        </button>
                        <button
                            className="bg-customBlue text-customBeige hover:bg-customRed"
                            onClick={handleConfirmModal}
                        >
                            Bestätigen
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
