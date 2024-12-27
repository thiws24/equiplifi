import * as React from "react"
import { useState } from "react"
import { ReturnProps } from "../interfaces/ReturnProps"

interface Props {
    processId: number,
    id?: number,
    guid: string,
    data?: {
        data: ReturnProps[]
        count: number
    },
    onConfirmReturn: (processId: number, guid: string) => Promise<void>,

}

export const ConfirmReturnCard: React.FC<Props> = ({
                                                       processId,
                                                       guid,
                                                       data,
                                                       onConfirmReturn,
                                                       id
                                                   }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleReturn = () => {
        setIsModalOpen(true)
    }

    const handleConfirmModal = async () => {
        await onConfirmReturn(processId, guid)
        setIsModalOpen(false)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    const formatDate = (date: string | undefined): string => {
        if (!date) return ""
        const parsedDate = new Date(date)
        const day = String(parsedDate.getDate()).padStart(2, "0")
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0")
        const year = parsedDate.getFullYear()
        return `${day}.${month}.${year}`
    }

    return (
        <div className="mb-10 text-sm border p-4 rounded shadow-md">
            <p>Prozess-ID: {processId}</p>
            <p>Reservierungs-ID: {id}</p>
            <ul className="list-disc pl-4">
                {data?.data.map((reservation, index) => (
                    <li key={index}>
                        Item-ID: {reservation.itemId},
                    </li>
                ))}
            </ul>
            <button
                className="bg-customBlue text-customBeige text-sm px-4 py-2 rounded hover:bg-customRed mt-4"
                onClick={handleReturn}
            >
                Rückgabe bestätigen
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-lg font-bold mb-4">Sind Sie sicher, dass die Rückgabe erfolgreich war?</h2>
                        <p>Prozess-ID: {processId}</p>
                        <ul className="list-disc pl-4 mb-4">
                            {data?.data.map((reservation, index) => (
                                <li key={index}>
                                    Item-ID: {reservation.itemId}
                                </li>
                            ))}
                        </ul>
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