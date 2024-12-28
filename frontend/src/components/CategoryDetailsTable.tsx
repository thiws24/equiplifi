import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { customTheme } from '../customTheme';
import { ColDef } from "ag-grid-community";
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import { AG_GRID_LOCALE_DE } from '@ag-grid-community/locale';
import { useNavigate } from 'react-router-dom';
import {CategoryDetailsProps} from "../interfaces/CategoryDetailsProps";

interface CategoryDetailsTableProps {
    categoryDetails: CategoryDetailsProps[];
    colDefs: ColDef<CategoryDetailsProps, any>[];
    loading: boolean;
}

const CategoryDetailsTable: React.FC<CategoryDetailsTableProps> = ({ categoryDetails, colDefs, loading }) => {
    const navigate = useNavigate()
    return (
        <div className='h-[550px] min-w-[350px]'>
            <AgGridReact
                rowData={categoryDetails}
                columnDefs={colDefs}
                pagination={true}
                paginationAutoPageSize={true}
                loading={loading}
                localeText={AG_GRID_LOCALE_DE}
                onRowClicked={(e) => navigate(`/item/${e?.data?.id}`)}
                theme={customTheme}
            />
        </div>
    )
}

export default CategoryDetailsTable
