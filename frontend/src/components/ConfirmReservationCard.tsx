import * as React from "react"
import { ProcessDataValueProps } from "../interfaces/ProcessDataValueProps"
import { formatDate } from "../lib/formatDate"
import { map } from "lodash"

interface Props {
    processId: number
    guid: string
    data?: ProcessDataValueProps[]
    onConfirmReservation: (processId: number, guid: string) => Promise<void>
}

export const ConfirmReservationCard: React.FC<Props> = ({
                                                            processId,
                                                            guid,
                                                            data,
                                                            onConfirmReservation
                                                        }) => {
    const handleConfirm = async () => {
        await onConfirmReservation(processId, guid)
    }

    const itemIds: number[] = map(data, "itemId")

    return (
        <div className="mb-10 text-sm border p-5 rounded shadow-md">
            <div className="grid grid-cols-[max-content_auto] gap-x-10 gap-y-2">
                <b>Prozess-ID:</b>
                <div>{processId}</div>
                <b>Kategorie-ID:</b>
                <div>{data ? data[0]?.categoryId : '-'}</div>
                <b>Anzahl:</b>
                <div>{data?.length}</div>
                <b>Startdatum:</b>
                <div>{data ? formatDate(data[0]?.startDate) : '-'}</div>
                <b>Enddatum:</b>
                <div>{data ? formatDate(data[0]?.endDate) : '-'}</div>
                <b>Item IDs:</b>
                <div>{itemIds.join(', ')}</div>
            </div>
            <button
                className="bg-customBlue text-customBeige text-sm px-4 py-2 rounded hover:bg-customRed"
                onClick={handleConfirm}
            >
                Reservierung bestätigen
            </button>
        </div>
    )
}
