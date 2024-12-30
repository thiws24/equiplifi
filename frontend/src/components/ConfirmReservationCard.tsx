import * as React from "react"
import { ProcessDataValueProps } from "../interfaces/ProcessDataValueProps"
import { formatDate } from "../lib/formatDate"
import { map } from "lodash"
import {
    Calendar,
    CalendarCheck,
    CalendarX,
    CalendarX2,
    ClipboardList,
    List,
    Tag,
    User
} from "lucide-react"
import { Button } from "./ui/button"
import { CardHeader } from "./ui/card"

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
        <div>
            <div className="mb-6 text-sm border p-5 rounded shadow-md flex flex-col md:flex-row justify-start items-start md:items-center bg-white">
                <div className="flex-1 min-w-[200px] grid grid-cols-[max-content_auto] gap-x-4 gap-y-2">
                    <div className="flex items-center">
                        <b className="text-base mb-2">
                            Reservierung #{processId}
                        </b>
                    </div>
                    <div></div>
                    <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-customOrange" />
                        <b>Benutzername:</b>
                    </div>
                    <div>{userName ?? "-"}</div>

                    <div className="flex items-center">
                        <List className="w-4 h-4 mr-2 text-customOrange" />
                        <b>Anzahl:</b>
                    </div>
                    <div>{data?.length}</div>

                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-customOrange" />
                        <b>Startdatum:</b>
                    </div>
                    <div>{data ? formatDate(data[0]?.startDate) : "-"}</div>

                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-customOrange" />
                        <b>Enddatum:</b>
                    </div>
                    <div>{data ? formatDate(data[0]?.endDate) : "-"}</div>

                    <div className="flex items-center">
                        <ClipboardList className="w-4 h-4 mr-2 text-customOrange" />
                        <b>Prozess-ID:</b>
                    </div>
                    <div>{processId}</div>

                    <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-customOrange" />
                        <b>Kategorie-ID:</b>
                    </div>
                    <div>{data ? data[0]?.categoryId : "-"}</div>

                    <div className="flex items-center">
                        <ClipboardList className="w-4 h-4 mr-2 text-customOrange" />
                        <b className="mb-4 md:mb-0">Item IDs:</b>
                    </div>
                    <div>{itemIds.join(", ")}</div>
                </div>
                <div className="flex flex-row gap-2 justify-center items-center self-end flex-wrap mt-4 md:mt-0">
                    <button
                        className="bg-customBlack text-customBeige text-sm px-4 py-2 rounded hover:bg-customBlack hover:text-customOrange flex items-center justify-center"
                        onClick={handleCancellation}
                    >
                        <CalendarX className="w-4 h-4 mr-2" />
                        Ablehnen
                    </button>
                    <button
                        className="bg-customOrange text-white text-sm px-4 py-2 rounded hover:bg-orange-600 flex items-center justify-center"
                        onClick={handleConfirmation}
                    >
                        <CalendarCheck className="w-4 h-4 mr-2" />
                        Bestätigen
                    </button>
                </div>
            </div>
        </div>
    )
}
