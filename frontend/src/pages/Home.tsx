import React from "react"
import { ColDef } from "ag-grid-community"
import { InventoryItemProps } from "../interfaces/InventoryItemProps"
import { TableGalleryView } from "../components/TableGalleryView"
import CustomToasts from "../components/CustomToasts"
import { ToastContainer } from "react-toastify"

function Home() {
    const [inventoryItems, setInventoryItems] = React.useState<
        InventoryItemProps[]
    >([])
    const colDefs: ColDef<InventoryItemProps, any>[] = [
        {
            field: "id",
            headerName: "ID",
            flex: 1,
            minWidth: 150,
            filter: "agSetColumnFilter"
        },
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            minWidth: 150,
            filter: "agSetColumnFilter"
        },
        {
            field: "icon",
            headerName: "ICON",
            flex: 1,
            minWidth: 100,
            filter: "agSetColumnFilter"
        },
        {
            field: "photoUrl",
            headerName: "Foto",
            flex: 1,
            minWidth: 150,
            cellRenderer: (params: any) => (
                <div>
                    {params.data.photoUrl ? (
                        <img
                            style={{ height: 40 }}
                            src={params.data.photoUrl}
                            alt={params.data.description}
                        />
                    ) : ""}
                </div>
            )
        }
    ]
    const [loading, setLoading] = React.useState(true)

    async function fetchInventoryItems() {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories`
            )
            if (response.ok) {
                const data = await response.json()
                setInventoryItems(data)
            }
        } catch (e) {
            CustomToasts.error({
                message: "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut."
            })
            console.log(e)
        }
        setLoading(false)
    }

    React.useEffect(() => {
        void fetchInventoryItems()
    }, [])
    return (
        <div className="m-10">
            <ToastContainer />
            <main className="main">
                <div className="font-semibold text-3xl text-customBlue flex justify-center w-full text-center">
                    Inventarverwaltung
                </div>
                <TableGalleryView
                    data={inventoryItems}
                    colDefs={colDefs}
                    loading={loading}
                />
            </main>
        </div>
    )
}

export default Home
