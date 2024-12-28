import * as React from "react"
import { ProcessInputProps } from "../interfaces/ProcessInputProps"

interface Props {
    processId: number
    guid: string
    data?: ProcessInputProps
    onConfirmReservation: (processId: number, guid: string) => Promise<void>
    onCancelReservation: (processId: number, guid: string) => Promise<void>
}

export const ConfirmReservationCard: React.FC<Props> = ({
                                                            processId,
                                                            guid,
                                                            data,
                                                            onConfirmReservation,
                                                            onCancelReservation
                                                        }) => {
    const formatDate = (date: string | undefined): string => {
        if (!date) return ""
        const parsedDate = new Date(date)
        const day = String(parsedDate.getDate()).padStart(2, "0")
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0")
        const year = parsedDate.getFullYear()
        return `${day}.${month}.${year}`
    }

    const handleConfirmReservation = async () => {
        await onConfirmReservation(processId, guid)
    }

    const handleConfirmCancelation = async () => {
        await onCancelReservation(processId, guid)
    }

    return (
        <div className="mb-10 text-sm border p-4 rounded shadow-md flex flex-wrap items-start">
            <div className="flex-1 min-w-[200px]">
                <p>Prozess-ID: {processId}</p>
                <p>Benutzername: {data?.userName}</p>
                <p>Kategorie-ID: {data?.categoryId}</p>
                <p>Anzahl: {data?.count}</p>
                <p>Startdatum: {formatDate(data?.startDate)}</p>
                <p>Enddatum: {formatDate(data?.endDate)}</p>
            </div>
            <div className="flex flex-col gap-2 mt-4 min-w-[200px]">
                <button
                    className="bg-customBlue text-customBeige text-sm px-4 py-2 rounded hover:brightness-90"
                    onClick={handleConfirmReservation}
                >
                    Reservierung bestätigen
                </button>
                <button
                    className="bg-customRed text-customBeige text-sm px-4 py-2 rounded hover:brightness-90"
                    onClick={handleConfirmCancelation}
                >
                    Reservierung ablehnen
                </button>
            </div>
        </div>
    )
}
