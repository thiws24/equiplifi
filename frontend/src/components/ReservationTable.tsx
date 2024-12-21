import React from "react"
import { AgGridReact } from "ag-grid-react"
import { AG_GRID_LOCALE_DE } from "@ag-grid-community/locale"
import { customTheme } from "../customTheme"
import { ReservationItemProps } from "../interfaces/ReservationItemProps"
import { ColDef } from "ag-grid-community"

interface ReservationCardProps {
    reservationItems: ReservationItemProps[]
    colDefs: ColDef<ReservationItemProps>[]
    loading: boolean
}

const ReservationTable: React.FC<ReservationCardProps> = ({
    reservationItems,
    colDefs,
    loading
}) => {
    return (
        <div className="h-[550px]">
            <AgGridReact
                rowData={reservationItems}
                columnDefs={colDefs}
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 25, 50]}
                loading={loading}
                localeText={AG_GRID_LOCALE_DE}
                theme={customTheme}
            />
        </div>
    )
}

export default ReservationTable
