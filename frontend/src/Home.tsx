import React from 'react';
import { ColDef } from "ag-grid-community"
import { InventoryItemProps } from "./interfaces/InventoryItemProps";
import { TableGalleryView } from "./components/TableGalleryView";

function Home() {
    const [inventoryItems, setInventoryItems] = React.useState<InventoryItemProps[]>([])

    const colDefs: ColDef<InventoryItemProps, any>[] = [
        { field: "id", flex: 1, filter: 'agSetColumnFilter' },
        { field: "name", flex: 1, filter: 'agSetColumnFilter' },
        { field: "icon", flex: 1, filter: 'agSetColumnFilter' },
        { field: "photo", flex: 1, cellRenderer: (params: any) => <img style={{ height: 40 }} src={params.data.photo} alt={params.data.description}/> },
        { field: "urn", flex: 1, filter: 'agSetColumnFilter' }
    ]

    const [loading, setLoading] = React.useState(true);

    async function fetchInventoryItems() {
        try {
            const response = await fetch(`${process.env.REACT_APP_II_SERVICE_HOST}/api/inventoryitems`)
            if (response.ok) {
                const data = await response.json();
                setInventoryItems(data);
            }
        } catch (e) {
            console.log(e)
        }

        setLoading(false);
    }


    React.useEffect(() => {
        void fetchInventoryItems();
    }, [])

    return (
        <div className="m-10">
            <main className="main">
                <div className='font-semibold text-3xl text-customBlue flex justify-center w-full text-center'>Inventarverwaltung</div>
                <TableGalleryView
                    data={inventoryItems}
                    colDefs={colDefs}
                    loading={loading}
                />
            </main>
        </div>
    );

}

export default Home;