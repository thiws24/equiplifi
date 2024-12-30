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
import { CalendarCheck, CalendarX, ClipboardList, List, PackageCheck } from "lucide-react"

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
        <div className="mb-6 text-sm border p-5 rounded shadow-md flex flex-col md:flex-row justify-start items-start md:items-center bg-white relative">
            <div className="flex-1 min-w-[200px] grid grid-cols-[max-content_auto] gap-x-4 gap-y-2">
                <div className="flex items-center">
                    <b className="text-base mb-2">Rückgabe #{processId}</b>
                </div>
                <div></div>
                <div className="flex items-center">
                    <List className="w-4 h-4 mr-2 text-customOrange" />
                    <b>Anzahl Items:</b>
                </div>
                <div>{itemIds.length}</div>
                <div className="flex items-center">
                    <ClipboardList className="w-4 h-4 mr-2 text-customOrange" />
                    <b>Prozess-ID:</b>
                </div>
                <div>{processId}</div>

                <div className="flex items-center">
                    <ClipboardList className="w-4 h-4 mr-2 text-customOrange" />
                    <b>Item IDs:</b>
                </div>
                <div>{itemIds.join(", ")}</div>
            </div>
            <div className="flex flex-row gap-2 justify-center items-center self-end flex-wrap mt-4 md:mt-0">
                <button
                    className="bg-customOrange text-white text-sm px-4 py-2 rounded hover:bg-orange-600 flex items-center justify-center"
                    onClick={() => setIsModalOpen(true)}
                >
                    <PackageCheck className="w-4 h-4 mr-2" />
                    Bestätigen
                </button>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rückgabe bestätigen</DialogTitle>
                        <DialogDescription>
                            Sind Sie sicher, dass die Rückgabe erfolgreich war?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <ClipboardList className="w-4 h-4 mr-2 text-customOrange" />
                            <p>Prozess-ID: {processId}</p>
                        </div>
                        <div className="flex items-center">
                            <ClipboardList className="w-4 h-4 mr-2 text-customOrange" />
                            <p>Item-IDs: {itemIds.join(", ")}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <button
                            className="bg-customBlack text-white text-sm px-4 py-2 rounded hover:text-customOrange flex items-center"
                            onClick={handleCloseModal}
                        >
                            Abbrechen
                        </button>
                        <button
                            className="bg-customOrange text-white text-sm px-4 py-2 rounded hover:bg-orange-600 flex items-center"
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
