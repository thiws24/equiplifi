import React from 'react';
import {AgGridReact} from 'ag-grid-react';
import '../globals.css';
import {customTheme} from '../customTheme';
import {ColDef} from "ag-grid-community";
import {InventoryItemProps} from "../interfaces/InventoryItemProps";
import {AG_GRID_LOCALE_DE} from '@ag-grid-community/locale';
import {useNavigate} from 'react-router-dom';

interface InventoryCardProps {
    inventoryItems: InventoryItemProps[];
    colDefs: ColDef<InventoryItemProps, any>[];
    loading: boolean;
}

const InventoryTable: React.FC<InventoryCardProps> = ({inventoryItems, colDefs, loading}) => {
    const navigate = useNavigate()
    return (
        <div className='h-[550px]'>
            <AgGridReact
                rowData={inventoryItems}
                columnDefs={colDefs}
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 25, 50]}
                loading={loading}
                onRowClicked={(e) => navigate(`/inventory-item/${e?.data?.id}`)}
                localeText={AG_GRID_LOCALE_DE}
                theme={customTheme}
            />
        </div>
    );
}

export default InventoryTable;

