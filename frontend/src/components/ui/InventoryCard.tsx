import React from 'react';
import '../../globals.css';
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef } from "ag-grid-community";

interface InventoryCardProps {
    inventoryItems: any[];
    colDefs: ColDef<any, any>[];
    loading: boolean;
  }
  
  const InventoryCard: React.FC<InventoryCardProps> = ({ inventoryItems, colDefs, loading }) => {
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
          />
        </CardContent>
      </Card>
    );
  }
  
  export default InventoryCard;

  