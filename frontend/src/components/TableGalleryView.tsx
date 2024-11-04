import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTable, faTableCells } from "@fortawesome/free-solid-svg-icons";
import { ColDef } from "ag-grid-community"
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import InventoryTable from "./InventoryTable";
import { ItemsGallery } from "./ItemsGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface Props {
  data: InventoryItemProps[]
  colDefs: ColDef<InventoryItemProps, any>[];
  loading: boolean
}

export const TableGalleryView: React.FC<Props> = ({ data, colDefs, loading }) => {
  return (
    <Tabs defaultValue="table-view" className="w-full">
      <TabsList className="grid grid-cols-2 justify-end w-[200px] ml-auto mb-4">
        <TabsTrigger value="table-view" className="tabs-trigger">
          <FontAwesomeIcon icon={faTable} style={{ color: "#f2e9d7" }}/>
        </TabsTrigger>
        <TabsTrigger value="gallery-view" className="tabs-trigger">
          <FontAwesomeIcon icon={faTableCells} style={{ color: "#f2e9d7" }}/>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="table-view">
        <InventoryTable inventoryItems={data} colDefs={colDefs} loading={loading}/>
      </TabsContent>
      <TabsContent value="gallery-view">
        <ItemsGallery items={data} />
      </TabsContent>
    </Tabs>
  );
};