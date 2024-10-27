import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef } from "ag-grid-community";
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import { AG_GRID_LOCALE_DE } from '@ag-grid-community/locale';
import { useNavigate } from 'react-router-dom';

interface InventoryCardProps {
    inventoryItems: InventoryItemProps[];
    colDefs: ColDef<InventoryItemProps, any>[];
    loading: boolean;
  }
  
  const InventoryTable: React.FC<InventoryCardProps> = ({ inventoryItems, colDefs, loading }) => {
    const navigate = useNavigate()
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent className='h-[500px] ag-theme-quartz'>
          <AgGridReact
            rowData={inventoryItems}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50]}
            loading={loading}
            onRowClicked={(e) => navigate(`/inventory-item/${e?.data?.id}`)}
            localeText={AG_GRID_LOCALE_DE}
          />
        </CardContent>
      </Card>
    );
  }
  
  export default InventoryTable;

  