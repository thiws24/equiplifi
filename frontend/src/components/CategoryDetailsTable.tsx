import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { detailsTheme } from '../customTheme';
import { ColDef } from "ag-grid-community";
import { AG_GRID_LOCALE_DE } from '@ag-grid-community/locale';
import { useNavigate } from 'react-router-dom';
import { ItemProps } from "../interfaces/CategoryProps"

interface CategoryDetailsTableProps {
    categoryDetails: ItemProps[];
    colDefs: ColDef<ItemProps, any>[];
    loading: boolean;
}

const CategoryDetailsTable: React.FC<CategoryDetailsTableProps> = ({ categoryDetails, colDefs, loading }) => {
    const navigate = useNavigate()
    return (
        <div className='h-[300px] min-w-[350px]'>
            <AgGridReact
                rowData={categoryDetails}
                columnDefs={colDefs}
                pagination={true}
                paginationAutoPageSize={true}
                loading={loading}
                localeText={AG_GRID_LOCALE_DE}
                onRowClicked={(e) => navigate(`/item/${e?.data?.id}`)}
                theme={detailsTheme}
            />
        </div>
    )
}

export default CategoryDetailsTable
