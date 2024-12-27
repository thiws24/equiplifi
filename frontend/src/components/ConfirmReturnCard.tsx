import * as React from "react"
import { useState } from "react"
import { ProcessDataValueProps } from "../interfaces/ProcessDataValueProps"
import { map } from "lodash"

interface Props {
    processId: number,
    data?: ProcessDataValueProps[]
    onConfirmReturn: (reservationId: number) => Promise<void>,
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
        // TODO: Toasts einfügen
        try {
            await Promise.all(map(data, (reservation) => {
                return onConfirmReturn(reservation.id)
            }))

            setIsModalOpen(false)
        } catch (error) {
            console.error('Error confirming return', error)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    const itemIds: number[] = map(data, "itemId")

    return (
        <div className="mb-10 text-sm border p-4 rounded shadow-md">
            <p>Prozess-ID: {processId}</p>
            <div>
                Item-IDs: {itemIds.join(", ")}
            </div>
            <button
                className="bg-customBlue text-customBeige text-sm px-4 py-2 rounded hover:bg-customRed mt-4"
                onClick={handleReturn}
            >
                Rückgabe bestätigen
            </button>

            {/* TODO: Use shadcn component: Dialog */}

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-lg font-bold mb-4">Sind Sie sicher, dass die Rückgabe erfolgreich war?</h2>
                        <p>Prozess-ID: {processId}</p>
                        <div>
                            Item-IDs: {itemIds.join(", ")}
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="bg-gray-300 text-black px-4 py-2 rounded mr-2 hover:bg-gray-400"
                                onClick={handleCloseModal}
                            >
                                Abbrechen
                            </button>
                            <button
                                className="bg-customBlue text-customBeige px-4 py-2 rounded hover:bg-customRed"
                                onClick={handleConfirmModal}
                            >
                                Bestätigen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}