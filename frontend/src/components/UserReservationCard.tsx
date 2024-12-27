import * as React from "react"
import { ProcessDataValueProps } from "../interfaces/ProcessDataValueProps"
import { map } from "lodash"
import { formatDate } from "../lib/formatDate"

interface Props {
    processId: number
    data?: ProcessDataValueProps[]
    taskTitle?: string
}

export const UserReservationCard: React.FC<Props> = ({
    processId,
    data,
    taskTitle,
}) => {
    const itemIds: number[] = map(data, "itemId")

    const openPickUpModal = () => {

    }

    return (
        <div className="text-sm border p-5 rounded shadow-md">
            <div className="grid grid-cols-[max-content_auto] gap-x-10 gap-y-1.5">
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
            {taskTitle === "Receive Inventory Manager confirmation" && <div className='italic mt-10'>Warten auf Bestätigung</div>}
            {taskTitle === "Receive Inventory Manager confirmation" && (
                <button
                    className="bg-customBlue text-customBeige text-sm px-4 py-2 rounded hover:bg-customRed"
                    onClick={openPickUpModal}
                >
                    Abholen
                </button>
            )}
        </div>
    )
}
