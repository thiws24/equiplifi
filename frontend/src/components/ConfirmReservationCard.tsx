import * as React from "react"
import { ProcessDataValueProps } from "../interfaces/ProcessDataValueProps"
import { formatDate } from "../lib/formatDate"
import { map } from "lodash"

interface Props {
    processId: number
    guid: string
    data?: ProcessDataValueProps[]
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
    const itemIds: number[] = map(data, "itemId")

    const handleConfirmation = async () => {
        await onConfirmReservation(processId, guid)
    }

    const handleCancelation = async () => {
        await onCancelReservation(processId, guid)
    }

    const handleConfirmReservation = async () => {
        await onConfirmReservation(processId, guid)
    }

    const handleConfirmCancelation = async () => {
        await onCancelReservation(processId, guid)
    }

    return (
        <div
            className="mb-6 text-sm border p-5 rounded shadow-md flex flex-col md:flex-row justify-start items-start md:items-center">
            <div className="flex-1 min-w-[200px] grid grid-cols-[max-content_auto] gap-x-10 gap-y-2">
                <b>Prozess-ID:</b>
                <div>{processId}</div>
                <b>Benutzername:</b>
                <div>{data ? data[0]?.userName : "-"}</div>
                <b>Kategorie-ID:</b>
                <div>{data ? data[0]?.categoryId : "-"}</div>
                <b>Anzahl:</b>
                <div>{data?.length}</div>
                <b>Startdatum:</b>
                <div>{data ? formatDate(data[0]?.startDate) : "-"}</div>
                <b>Enddatum:</b>
                <div>{data ? formatDate(data[0]?.endDate) : "-"}</div>
                <b className="mb-4 md:mb-0">Item IDs:</b>
                <div>{itemIds.join(", ")}</div>
            </div>
            <div
                className="flex flex-col gap-2 justify-center items-start md:justify-center md:items-center">
                <button
                    className="w-48 bg-customBlue text-customBeige text-sm px-4 py-2 rounded hover:brightness-90"
                    onClick={handleConfirmation}
                >
                    Reservierung bestätigen
                </button>
                <button
                    className="w-48 bg-customRed text-customBeige text-sm px-4 py-2 rounded hover:brightness-90"
                    onClick={handleCancelation}
                >
                    Reservierung ablehnen
                </button>
            </div>
        </div>

    )
}
