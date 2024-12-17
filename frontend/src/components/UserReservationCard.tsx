import * as React from "react"
import { ProcessInputProps } from "../interfaces/ProcessInputProps"

interface Props {
    processId: number
    data?: ProcessInputProps
}

export const UserReservationCard: React.FC<Props> = ({
    processId,
    data
}) => {
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
            <p>Kategorie-ID: {data?.categoryId}</p>
            <p>Anzahl: {data?.count}</p>
            <p>Startddatum: {formatDate(data?.startDate)}</p>
            <p>Enddatum: {formatDate(data?.endDate)}</p> <br/>
        </div>
    )
}
