import React, { useEffect } from "react"
import { ColDef } from "ag-grid-community"
import { TableGalleryView } from "../components/TableGalleryView"
import CustomToasts from "../components/CustomToasts"
import { fetchImage } from "../services/fetchImage"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { ItemDetailsProps } from "../interfaces/ItemDetailsProps"
import { Skeleton } from "../components/ui/skeleton"

function Inventory() {
    useEffect(() => {
        document.title = "Inventar | equipli"
        void fetchInventoryItems()
    }, [])

    const { token } = useKeycloak()

    const [inventoryItems, setInventoryItems] = React.useState<
        ItemDetailsProps[]
    >([])
    const colDefs: ColDef<ItemDetailsProps, any>[] = [
        {
            field: "name",
            headerName: "Inventargegenstand",
            minWidth: 250,
            cellRenderer: (params: any) => {
                const [image, setImage] = React.useState<string | null>(null)
                const [loading, setLoading] = React.useState(true)

                useEffect(() => {
                    const fetchItemImage = async () => {
                        try {
                            const fetchedImage = await fetchImage(
                                params.data.id,
                                token ?? ""
                            )
                            setImage(fetchedImage)
                        } catch (error) {
                            setImage("/image-placeholder.jpg")
                        } finally {
                            setLoading(false)
                        }
                    }

                    fetchItemImage()
                }, [params.data.id])

                return (
                    <div className="flex items-center">
                        {loading ? (
                            <Skeleton className="h-[60px] w-[60px] rounded-lg bg-gray-200" />
                        ) : (
                            <img
                                className="rounded-lg object-cover"
                                style={{ height: 60, width: 60 }}
                                src={image || "/image-placeholder.jpg"}
                            />
                        )}
                        <div className="ml-4 font-bold">{params.data.name}</div>
                    </div>
                )
            },
            flex: 1
        },
        {
            field: "description",
            headerName: "Beschreibung",
            flex: 2,
            minWidth: 200
        }
    ]

    const [loading, setLoading] = React.useState(true)

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

    return (
        <div className="max-w-[1440px] mx-auto">
            <div className="m-8 lg:m-20">
                <main className="main">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold">Inventar</h1>
                        <p className="text-sm text-muted-foreground">
                            {loading ? (
                                <Skeleton className="h-2 bg-gray-200 w-[250px] mt-2" />
                            ) : (
                                <span>
                                    {inventoryItems.length} {inventoryItems.length === 1 ? "Inventargegenstand" : "Inventargegenstände"}
                                </span>
                            )}
                        </p>
                    </div>

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

export default Inventory
