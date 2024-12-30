import * as React from "react"
import { ProcessDataValueProps } from "../interfaces/ProcessDataValueProps"
import { formatDate } from "../lib/formatDate"
import { map } from "lodash"
import { CalendarCheck, CalendarX, CalendarX2, User } from "lucide-react"
import { Button } from "./ui/button"

interface Props {
    processId: number
    guid: string
    data?: ProcessDataValueProps[]
    userName?: string
    onConfirmReservation: (processId: number, guid: string) => Promise<void>
    onCancelReservation: (processId: number, guid: string) => Promise<void>
}

export const ConfirmReservationCard: React.FC<Props> = ({
    processId,
    guid,
    data,
    userName,
    onConfirmReservation,
    onCancelReservation
}) => {
    const itemIds: number[] = map(data, "itemId")

    const handleConfirmation = async () => {
        await onConfirmReservation(processId, guid)
    }

    const handleCancellation = async () => {
        await onCancelReservation(processId, guid)
    }

    return (
        <div className="mb-6 text-sm border p-5 rounded shadow-md flex flex-col md:flex-row justify-start items-start md:items-center">
            <div className="flex-1 min-w-[200px] grid grid-cols-[max-content_auto] gap-x-10 gap-y-2">
                <b>Prozess-ID:</b>
                <div>{processId}</div>
                <b>Benutzername:</b>
                <div>{userName ?? "-"}</div>
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
            <div className="flex flex-row gap-2 justify-center items-center self-end">
                <Button
                    className="w-32 bg-customBlack text-customBeige text-sm px-4 py-2 rounded hover:bg-customBlack hover:text-customOrange flex items-center justify-center"
                    onClick={handleCancellation}
                >
                    <CalendarX className="w-4 h-4 mr-2" />
                    Ablehnen
                </Button>
                <Button
                    className="w-32 bg-customOrange text-white text-sm px-4 py-2 rounded hover:bg-orange-600 flex items-center justify-center"
                    onClick={handleConfirmation}
                >
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    Bestätigen
                </Button>
            </div>
        </div>
    )
}
