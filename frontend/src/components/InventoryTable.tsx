import React from "react"
import { AgGridReact } from "ag-grid-react"
import { inventoryTheme } from "../customTheme"
import { ColDef } from "ag-grid-community"
import { ItemDetailsProps } from "../interfaces/ItemDetailsProps"
import { AG_GRID_LOCALE_DE } from "@ag-grid-community/locale"
import { useNavigate } from "react-router-dom"
import { ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community"

ModuleRegistry.registerModules([ClientSideRowModelModule])

interface InventoryCardProps {
    inventoryItems: ItemDetailsProps[]
    colDefs: ColDef<ItemDetailsProps, any>[]
    loading: boolean
}

const InventoryTable: React.FC<InventoryCardProps> = ({
    inventoryItems,
    colDefs,
    loading
}) => {
    const navigate = useNavigate()
    return (
        <div className="h-[550px]">
            <AgGridReact
                rowData={inventoryItems}
                columnDefs={colDefs}
                pagination={true}
                paginationAutoPageSize={true}
                loading={loading}
                onRowClicked={(e) => navigate(`/category/${e?.data?.id}`)}
                localeText={AG_GRID_LOCALE_DE}
                theme={inventoryTheme}
            />
        </div>
    )
}

export default InventoryTable
