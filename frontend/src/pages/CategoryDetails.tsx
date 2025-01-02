import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from "../components/ui/card"
import { Button } from "../components/ui/button"
import { KeyValueRow } from "../components/KeyValueRow"
import { ColDef } from "ag-grid-community"
import CategoryDetailsTable from "../components/CategoryDetailsTable"
import { CustomToasts } from "../components/CustomToasts"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { ModuleRegistry, ClientSideRowModelModule } from "ag-grid-community"
import { CategoryProps, ItemProps } from "../interfaces/CategoryProps"
import { Input } from "../components/ui/input"
import { ArrowLeft } from "lucide-react"

ModuleRegistry.registerModules([ClientSideRowModelModule])
import { Pencil, PencilOff, Save } from "lucide-react"
import { fetchImage } from "../services/fetchImage"

export const itemsColDefs: ColDef<ItemProps>[] = [
    {
        headerName: "ID",
        field: "id",
        sortable: true,
        flex: 1
    },
    {
        headerName: "Status",
        field: "status",
        sortable: true,
        flex: 1
    },
    {
        headerName: "Lagerort",
        field: "location",
        sortable: true,
        flex: 1
    }
]

function CategoryDetails() {
    const [category, setCategory] = useState<CategoryProps>()
    const navigate = useNavigate()
    const { token, userInfo } = useKeycloak()
    const { id } = useParams()
    const [loading, setLoading] = React.useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [updatedData, setUpdatedData] = useState<{
        name: string
        description: string
        icon: string
        image?: any
    }>({
        name: "",
        description: "",
        icon: "",
        image: undefined
    })

    const [currentImage, setCurrentImage] = useState<string>()

    const isInventoryManager = userInfo?.groups?.includes("Inventory-Manager")

    const fetchCategory = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.ok) {
                const data = await response.json()

                // Fetch image
                const image = await fetchImage(data.id, token ?? "")

                setCategory(data)
                setCurrentImage(image)
                setUpdatedData({
                    name: data.name,
                    description: data.description,
                    icon: data.icon,
                    image: undefined
                })
            } else {
                CustomToasts.error({
                    message: "Diese Kategorie existiert nicht.",
                    onClose: () => navigate(`/`)
                })
            }
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!category) return

        if (updatedData?.image) {
            const formData = new FormData()
            formData.append("fileContent", updatedData.image)
            formData.append("contentType", updatedData.image.type)

            try {
                const res = await fetch(
                    `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories/${category.id}/image`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        body: formData
                    }
                )

                if (!res.ok) {
                    CustomToasts.error({
                        message: "Fehler beim Hochladen des Bildes."
                    })
                    return
                }
            } catch (e) {
                CustomToasts.error({
                    message: "Fehler beim Hochladen des Bildes."
                })
                return
            }
        }

        const updatedCategory = {
            ...category,
            name: updatedData.name || category.name,
            description: updatedData.description || category.description,
            icon: updatedData.icon || category.icon
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedCategory)
                }
            )

            if (response.ok) {
                const updatedCategoryResponse = await response.json()
                setCategory(updatedCategoryResponse)
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
                message: "Fehler beim Aktualisieren der Kategorie."
            })
        }
    }

    React.useEffect(() => {
        void fetchCategory()
    }, [])

    const editButtonTooltipText = isEditing
        ? "Bearbeiten beenden"
        : "Bearbeiten"
    return (
        <div className="max-w-[1000px] mx-auto">
            <CardHeader className="flex justify-self-auto mt-4">
                <CardTitle className="text-3xl text-customOrange col-span-2 flex flex-col items-center justify-center">
                    {`${category?.name}`}
                    <span className="text-lg text-customOrange font-semibold items-center mt-2">
                        {category?.id ? `Kategorie ${category.id}` : ""}
                    </span>
                </CardTitle>
            </CardHeader>
            <div className="p-4">
                <Card className="bg-white text-customBlack p-4 font-semibold">
                    <CardContent>
                        <div className="flex justify-end mt-4"></div>
                        {isInventoryManager ? (
                            <Button
                                tooltip={editButtonTooltipText}
                                className="fixed top-16 right-5 w-[55px] h-[55px] z-10 bg-customOrange text-customBeige rounded-full hover:bg-customRed"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? (
                                    <PencilOff size={24} />
                                ) : (
                                    <Pencil size={24} />
                                )}
                            </Button>
                        ) : (
                            <div />
                        )}
                        <div className="flex items-center justify-between">
                            <Button
                                tooltip="Zurück"
                                className="bg-customBlack text-white rounded-full hover:bg-customRed flex items-center justify-center w-[45px] h-[45px] p-0 shrink-0"
                                onClick={() => navigate("/")}
                            >
                                <ArrowLeft size={16} />
                            </Button>
                            <Button
                                className="w-[100px] bg-customBlue text-customBeige rounded hover:bg-customRed hover:text-customBeige"
                                onClick={() =>
                                    navigate(`/category/${id}/reservation`)
                                }
                            >
                                Ausleihen
                            </Button>
                        </div>
                        <div className="mb-8"></div>

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
                                    category?.name
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
                                    category?.description
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
                                    category?.icon
                                )}
                            </KeyValueRow>
                            <KeyValueRow label="Foto">
                                {!!currentImage && (
                                    <img
                                        src={currentImage}
                                        alt={category?.description}
                                        className="w-full h-80 object-contain object-left"
                                    />
                                )}
                                {isEditing ? (
                                    <>
                                        <div className="flex items-center gap-4 mt-4">
                                            {/* Button zum Öffnen des File-Browsers */}
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    document
                                                        .getElementById(
                                                            "file-upload"
                                                        )
                                                        ?.click()
                                                }
                                                className="text-white bg-customOrange hover:bg-customRed"
                                            >
                                                Bild hochladen
                                            </Button>

                                            {/* Textfeld zur Anzeige des Dateinamens */}
                                            <div className="text-sm text-gray-500 border rounded px-3 py-2 w-full">
                                                {updatedData.image
                                                    ? updatedData.image.name
                                                    : "Keine Datei ausgewählt"}
                                            </div>
                                        </div>

                                        {/* Unsichtbares Input-Feld */}
                                        <input
                                            type="file"
                                            id="file-upload"
                                            accept="image/png, image/jpeg, image/jpg"
                                            style={{ display: "none" }}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>
                                            ) => {
                                                if (e.target.files?.[0]) {
                                                    setUpdatedData({
                                                        ...updatedData,
                                                        image: e.target.files[0]
                                                    })
                                                }
                                            }}
                                        />
                                    </>
                                ) : null}
                            </KeyValueRow>
                        </dl>

                        {/* Save Button */}
                        {isEditing && (
                            <div className="flex justify-end mt-4">
                                <Button
                                    tooltip="Speichern"
                                    onClick={handleSave}
                                    className="fixed top-32 right-5 w-[55px] h-[55px] z-10 bg-customBlue text-customBeige rounded-full hover:bg-customBlue hover:brightness-90"
                                >
                                    <Save />
                                </Button>
                            </div>
                        )}

                        <div className="mt-6">
                            <h2 className="text-xl font-bold mb-4">
                                Exemplare{" "}
                            </h2>
                            <div className="overflow-x-auto min-w-full">
                                <CategoryDetailsTable
                                    categoryDetails={category?.items ?? []}
                                    colDefs={itemsColDefs}
                                    loading={loading}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default CategoryDetails
