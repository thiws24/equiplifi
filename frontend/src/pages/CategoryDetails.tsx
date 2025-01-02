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
import {
    ArrowLeft,
    ArrowRight,
    CalendarPlus,
    LetterText,
    Package
} from "lucide-react"

ModuleRegistry.registerModules([ClientSideRowModelModule])
import { Pencil, PencilOff, Save } from "lucide-react"
import { fetchImage } from "../services/fetchImage"
import { Skeleton } from "../components/ui/skeleton"

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
                    message: "Kategorie erfolgreich aktualisiert!"
                })
                setIsEditing(false)
                setTimeout(() => {
                    void fetchCategory()
                }, 200)
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
        <div className="max-w-[1440px] mx-auto">
            {isInventoryManager && (
                <Button
                    tooltip={editButtonTooltipText}
                    className="fixed top-16 right-5 w-[55px] h-[55px] z-10 bg-customOrange text-customBeige rounded-full hover:bg-orange-600"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? <PencilOff size={24} /> : <Pencil size={24} />}
                </Button>
            )}
            {/* Save Button */}
            {isEditing && (
                <Button
                    tooltip="Speichern"
                    onClick={handleSave}
                    className="fixed top-32 right-5 w-[55px] h-[55px] z-10 bg-customBlue text-customBeige rounded-full hover:bg-customBlue hover:brightness-90"
                >
                    <Save />
                </Button>
            )}

            <div className="m-8 lg:m-20">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold">Inventar</h1>
                    <p className="text-sm text-muted-foreground">
                        {loading ? (
                            <Skeleton className="h-2 bg-gray-200 w-[250px] mt-2" />
                        ) : (
                            <span>Kategorie {category?.id}</span>
                        )}
                    </p>
                </div>
                <div>
                    <Card className="bg-white border-none drop-shadow-2xl">
                        <CardHeader className="mb-2 flex flex-row justify-between flex-wrap">
                            <div className="flex items-center">
                                <Button
                                    tooltip="Zurück"
                                    className="bg-customBlack text-white rounded-full hover:bg-customRed flex items-center justify-center w-[45px] h-[45px] p-0 shrink-0"
                                    onClick={() => navigate("/")}
                                >
                                    <ArrowLeft size={16} />
                                </Button>
                                <CardTitle className="ml-4 text-2xl font-bold flex items-center flex-wrap">
                                    <div className="mr-2">
                                        {loading ? (
                                            <Skeleton className="h-8 w-8 rounded-full bg-gray-200" />
                                        ) : isEditing ? (
                                            <Input
                                                value={updatedData.icon}
                                                onChange={(e) =>
                                                    setUpdatedData({
                                                        ...updatedData,
                                                        icon: e.target.value
                                                    })
                                                }
                                                className="border border-gray-300 rounded px-2 py-1 w-12 text-center"
                                            />
                                        ) : (
                                            category?.icon
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        {loading ? (
                                            <Skeleton className="h-8 w-[150px] md:w-[250px] max-w-full bg-gray-200" />
                                        ) : isEditing ? (
                                            <Input
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
                                    </div>
                                </CardTitle>
                            </div>
                            <div className="hidden md:flex mr-2">
                                <Button
                                    className="text-customBeige bg-customOrange hover:bg-orange-600 hover:text-customBeige"
                                    onClick={() =>
                                        navigate(`/category/${id}/reservation`)
                                    }
                                >
                                    <CalendarPlus size={16} className="mr-2" />
                                    Ausleihen
                                    <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Editable Fields */}

                            <div className="flex flex-col-reverse md:flex-row items-start space-x-0 md:space-x-6 my-2">
                                <div className="flex flex-col md:w-1/2 w-full">
                                    <div className="m-4 mb-4">
                                        <div className="">
                                            <h2 className="text-md font-bold mb-4 flex items-center">
                                                <LetterText className="mr-2 h-4 w-4 text-customOrange" />
                                                Beschreibung
                                            </h2>
                                            <div className="text-sm">
                                                {loading ? (
                                                    <div className="space-y-4">
                                                        <Skeleton className="h-4 bg-gray-200 w-full max-w-[450px]" />
                                                        <Skeleton className="h-4 bg-gray-200 w-full max-w-[350px]" />
                                                        <Skeleton className="h-4 bg-gray-200 w-full max-w-[350px]" />
                                                    </div>
                                                ) : isEditing ? (
                                                    <textarea
                                                        value={
                                                            updatedData.description
                                                        }
                                                        onChange={(e) =>
                                                            setUpdatedData({
                                                                ...updatedData,
                                                                description:
                                                                    e.target
                                                                        .value
                                                            })
                                                        }
                                                        className="border border-gray-300 rounded px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    category?.description
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-16">
                                            <div className="mb-4">
                                                <h2 className="text-md font-bold mb-4 flex items-center">
                                                    <Package className="mr-2 h-4 w-4 text-customOrange" />
                                                    Exemplare
                                                </h2>
                                            </div>
                                            {loading ? (
                                                <Skeleton className="bg-gray-200 w-full h-[300px]" />
                                            ) : (
                                                <div className="overflow-x-auto min-w-full">
                                                    <CategoryDetailsTable
                                                        categoryDetails={
                                                            category?.items ??
                                                            []
                                                        }
                                                        colDefs={itemsColDefs}
                                                        loading={loading}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center md:w-1/2 p-8 md:p-16 self-center w-full">
                                    {loading ? (
                                        <Skeleton className="h-[400px] bg-gray-200 w-full max-w-[400px]" />
                                    ) : (
                                        <img
                                            src={
                                                currentImage ||
                                                "/image-placeholder.jpg"
                                            }
                                            alt={category?.name}
                                            className="object-cover rounded-lg w-full"
                                        />
                                    )}
                                    {isEditing ? (
                                        <>
                                            <div className="flex items-center gap-4 mt-4">
                                                {/* Button to open the file browser */}
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
                                                {/* Text field to display the file name */}
                                                <div className="text-sm text-gray-500 border rounded px-3 py-2 w-full">
                                                    {updatedData.image
                                                        ? updatedData.image.name
                                                        : "Keine Datei ausgewählt"}
                                                </div>
                                            </div>
                                            {/* Hidden input field */}
                                            <input
                                                type="file"
                                                id="file-upload"
                                                accept="image/png, image/jpeg, image/jpg"
                                                style={{
                                                    display: "none"
                                                }}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>
                                                ) => {
                                                    if (e.target.files?.[0]) {
                                                        setUpdatedData({
                                                            ...updatedData,
                                                            image: e.target
                                                                .files[0]
                                                        })
                                                    }
                                                }}
                                            />
                                        </>
                                    ) : null}
                                </div>
                            </div>
                            <div className="flex md:hidden">
                                <Button
                                    className="text-customBeige bg-customOrange hover:bg-orange-600 hover:text-customBeige"
                                    onClick={() =>
                                        navigate(`/category/${id}/reservation`)
                                    }
                                >
                                    <CalendarPlus size={16} className="mr-2" />
                                    Ausleihen
                                    <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default CategoryDetails
