import React from "react"
import { ColDef } from "ag-grid-community"
import { InventoryItemProps } from "../interfaces/InventoryItemProps"
import { TableGalleryView } from "../components/TableGalleryView"
import CustomToasts from "../components/CustomToasts"
import { ToastContainer } from "react-toastify"
import { useKeycloak } from "../keycloak/KeycloakProvider"

function Home() {
    const [inventoryItems, setInventoryItems] = React.useState<
        InventoryItemProps[]
    >([])
    const colDefs: ColDef<InventoryItemProps, any>[] = [
        {
            field: "id",
            headerName: "ID",
            flex: 1,
            minWidth: 150
        },
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            minWidth: 150
        },
        {
            field: "icon",
            headerName: "ICON",
            flex: 1,
            minWidth: 100
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
                    ) : (
                        ""
                    )}
                </div>
            )
        }
    ]
    const [loading, setLoading] = React.useState(true)
    const { token } = useKeycloak()

    async function fetchInventoryItems() {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                }
            )
            if (response.ok) {
                const data = await response.json()
                setInventoryItems(data)
            }
        } catch (e) {
            CustomToasts.error({
                message:
                    "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut."
            })
            console.log(e)
        }
        setLoading(false)
    }

    React.useEffect(() => {
        void fetchInventoryItems()
    }, [])

    const { keycloak } = useKeycloak()

    const firstName = keycloak.tokenParsed?.given_name || ""
    const username = keycloak.tokenParsed?.preferred_username || "User"

    return (
        <div className="max-w-[1440px] mx-auto">
            <div className="m-8">
                <ToastContainer />
                <main className="main">
                    <h1 className="text-3xl font-bold mb-20">
                        Hallo,{" "}
                        <span className="text-customOrange">
                            {firstName || username}
                        </span>
                    </h1>

                    <TableGalleryView
                        data={inventoryItems}
                        colDefs={colDefs}
                        loading={loading}
                    />
                </main>
            </div>
        </div>
    )
}

export default Home
