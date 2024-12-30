import * as React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTable, faTableCells } from "@fortawesome/free-solid-svg-icons"
import { ColDef } from "ag-grid-community"
import { ItemDetailsProps } from "../interfaces/ItemDetailsProps"
import InventoryTable from "./InventoryTable"
import { ItemsGallery } from "./ItemsGallery"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Grid2X2, List, Table } from "lucide-react"

interface Props {
    data: ItemDetailsProps[]
    colDefs: ColDef<ItemDetailsProps, any>[]
    loading: boolean
}

export const TableGalleryView: React.FC<Props> = ({
    data,
    colDefs,
    loading
}) => {
    return (
        <Tabs defaultValue="table-view" className="w-full">
            <TabsList className="grid grid-cols-2 justify-end w-[60px] ml-auto mb-4">
                <TabsTrigger value="table-view" className="tabs-trigger m-1">
                    <List className="h-8"/>
                </TabsTrigger>
                <TabsTrigger value="gallery-view" className="tabs-trigger m-1">
                    <Grid2X2 className="h-8"/>
                </TabsTrigger>
            </TabsList>
            <TabsContent value="table-view">
                <InventoryTable
                    inventoryItems={data}
                    colDefs={colDefs}
                    loading={loading}
                />
            </TabsContent>
            <TabsContent value="gallery-view">
                <ItemsGallery items={data} />
            </TabsContent>
        </Tabs>
    )
}
