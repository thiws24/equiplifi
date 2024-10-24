import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTable, faTableCells } from "@fortawesome/free-solid-svg-icons";
import { ColDef } from "ag-grid-community"
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import InventoryCard from "./InventoryCard";
import { ItemsGallery } from "./ItemsGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface Props {
  data: InventoryItemProps[]
  colDefs: ColDef<InventoryItemProps, any>[];
  loading: boolean
  onPageChange: (page: number) => void;
  totalPages: number;
}

export const TableGalleryView: React.FC<Props> = ({ data, colDefs, loading, totalPages, onPageChange }) => {
  return (
    <Tabs defaultValue="table-view" className="w-full">
      <TabsList className="grid grid-cols-2 justify-end w-[200px] ml-auto mb-4">
        <TabsTrigger value="table-view">
          <FontAwesomeIcon icon={faTable}/>
        </TabsTrigger>
        <TabsTrigger value="gallery-view">
          <FontAwesomeIcon icon={faTableCells}/>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="table-view">
        <InventoryCard inventoryItems={data} colDefs={colDefs} loading={loading}/>
      </TabsContent>
      <TabsContent value="gallery-view">
        <ItemsGallery items={data} totalPages={totalPages} onPageChange={onPageChange}/>
      </TabsContent>
    </Tabs>
  );
};