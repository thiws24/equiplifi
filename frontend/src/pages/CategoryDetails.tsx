import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from "../components/ui/card"
import { InventoryItemProps } from "../interfaces/InventoryItemProps"
import { Button } from "../components/ui/button"
import { KeyValueRow } from "../components/KeyValueRow"
import { CategoryDetailsProps } from "../interfaces/CategoryDetailsProps"
import { ColDef } from "ag-grid-community"
import CategoryDetailsTable from "../components/CategoryDetailsTable"
import { CustomToasts } from "../components/CustomToasts"
import { ToastContainer } from "react-toastify"

export const categoryColDefs: ColDef<CategoryDetailsProps>[] = [
    {
        headerName: "ID",
        field: "id",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1
    },
    {
        headerName: "Status",
        field: "status",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1
    },
    {
        headerName: "Lagerort",
        field: "location",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1
    }
]

function CategoryDetails() {
    const [inventoryItem, setInventoryItem] = useState<InventoryItemProps>()
    const navigate = useNavigate()
    const { id } = useParams()
    const [categoryDetails, setCategoryDetails] = useState<
        CategoryDetailsProps[]
    >([])
    const [loading, setLoading] = React.useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [updatedData, setUpdatedData] = useState({
        name: "",
        description: "",
        icon: ""
    })

    const fetchItems = React.useCallback(async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories/${id}`
            )
            if (response.ok) {
                const data = await response.json()
                setInventoryItem(data)
                setUpdatedData({
                    name: data.name,
                    description: data.description,
                    icon: data.icon
                })
                setCategoryDetails(data.items || [])
            }
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }, [id])

    const handleSave = async () => {
        if (!inventoryItem) return

        const updatedCategory = {
            ...inventoryItem,
            name: updatedData.name || inventoryItem.name,
            description: updatedData.description || inventoryItem.description,
            icon: updatedData.icon || inventoryItem.icon
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedCategory)
                }
            )

            if (response.ok) {
                const updatedCategoryResponse = await response.json()
                setInventoryItem(updatedCategoryResponse)
                CustomToasts.success({
                    message: "Kategorie erfolgreich aktualisiert!",
                    onClose: () => window.open(`/category/${id}`, "_self")
                })
                setIsEditing(false)
            } else if (response.status === 400) {
                CustomToasts.error({
                    message: "Name der Kategorie existiert bereits."
                })
            } else {
                CustomToasts.error({
                    message: "Fehler beim Aktualisieren der Kategorie."
                })
            }
        } catch (error) {
            console.error("Fehler beim Speichern:", error)
            CustomToasts.error({
                message: "Fehler beim Aktualisieren der Kategorie. Bitte versuchen Sie es später erneut."
            })
        }
    }

    React.useEffect(() => {
        void fetchItems()
    }, [fetchItems])

    return (
        <div className="max-w-[1000px] mx-auto">
            <ToastContainer />
            <CardHeader className="flex justify-self-auto mt-4">
                <CardTitle className="text-3xl text-customOrange col-span-2 flex flex-col items-center justify-center">
                    {`${inventoryItem?.name}`}
                    <span className="text-lg text-customOrange font-semibold items-center mt-2">
                        {inventoryItem?.id ? `Kategorie ${inventoryItem.id}` : ""}
                    </span>
                </CardTitle>
            </CardHeader>
            <div className="p-4">
                <Card className="bg-white text-customBlack p-4 font-semibold">
                    <CardContent>
                        <div className="flex justify-between mt-4">
                            <Button
                                className="bg-customBlue text-customBeige rounded hover:bg-customRed"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing
                                    ? "Bearbeitung abbrechen"
                                    : "Kategorie bearbeiten"}
                            </Button>
                            <Button
                                className="w-[130px] bg-customBlue text-customBeige rounded hover:bg-customRed hover:text-customBeige"
                                onClick={() =>
                                    navigate(
                                        `/category/${id}/reservation`
                                    )
                                }
                            >
                                Ausleihen
                            </Button>
                        </div>

                        {/* Editable Fields */}
                        <dl className="divide-y divide-customBeige">
                            <KeyValueRow label="Kategorie ID">
                                {" "}
                                {id}{" "}
                            </KeyValueRow>
                            <KeyValueRow label="Name">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={updatedData.name}
                                        onChange={(e) =>
                                            setUpdatedData({
                                                ...updatedData,
                                                name: e.target.value
                                            })
                                        }
                                        className="border border-gray-300 rounded px-2 py-1 w-full"
                                    />
                                ) : (
                                    inventoryItem?.name
                                )}
                            </KeyValueRow>
                            <KeyValueRow label="Beschreibung">
                                {isEditing ? (
                                    <textarea
                                        value={updatedData.description}
                                        onChange={(e) =>
                                            setUpdatedData({
                                                ...updatedData,
                                                description: e.target.value
                                            })
                                        }
                                        className="border border-gray-300 rounded px-2 py-1 w-full"
                                    />
                                ) : (
                                    inventoryItem?.description
                                )}
                            </KeyValueRow>
                            <KeyValueRow label="Icon">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={updatedData.icon}
                                        onChange={(e) =>
                                            setUpdatedData({
                                                ...updatedData,
                                                icon: e.target.value
                                            })
                                        }
                                        className="border border-gray-300 rounded px-2 py-1 w-full text-center"
                                    />
                                ) : (
                                    inventoryItem?.icon
                                )}
                            </KeyValueRow>
                            <KeyValueRow label="Foto">
                                {!!inventoryItem?.photoUrl && (
                                    <img
                                        src={inventoryItem?.photoUrl}
                                        alt={inventoryItem?.description}
                                        className="w-full h-80 object-contain"
                                    />
                                )}
                            </KeyValueRow>
                        </dl>

                        {/* Save Button */}
                        {isEditing && (
                            <div className="flex justify-end mt-4">
                                <Button
                                    onClick={handleSave}
                                    className="w-[130px] bg-customBlue text-customBeige rounded hover:bg-customRed hover:text-customBeige"
                                >
                                    Speichern
                                </Button>
                            </div>
                        )}

                        <div className="mt-6">
                            <h2 className="text-xl font-bold mb-4">
                                Exemplare{" "}
                            </h2>
                            <CategoryDetailsTable
                                categoryDetails={categoryDetails}
                                colDefs={categoryColDefs}
                                loading={loading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={() => navigate("/")}
                            className="w-[130px] bg-customBlue text-customBeige rounded hover:bg-customRed"
                        >
                            &larr; Zurück
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default CategoryDetails
