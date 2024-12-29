import * as React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTable, faTableCells } from "@fortawesome/free-solid-svg-icons"
import { ColDef } from "ag-grid-community"
import { ItemDetailsProps } from "../interfaces/ItemDetailsProps"
import InventoryTable from "./InventoryTable"
import { ItemsGallery } from "./ItemsGallery"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

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
            <TabsList className="grid grid-cols-2 justify-end w-[200px] ml-auto mb-4">
                <TabsTrigger value="table-view" className="tabs-trigger">
                    <FontAwesomeIcon icon={faTable} />
                </TabsTrigger>
                <TabsTrigger value="gallery-view" className="tabs-trigger">
                    <FontAwesomeIcon icon={faTableCells} />
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
