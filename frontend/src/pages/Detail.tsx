import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from "../components/ui/card"
import { ItemDetailsProps } from "../interfaces/ItemDetailsProps"
import { Button } from "../components/ui/button"
import { KeyValueRow } from "../components/KeyValueRow"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import CustomToasts from "../components/CustomToasts"
import {
    Pencil,
    PencilOff,
    Save,
    ArrowLeft,
    CalendarPlus,
    ArrowRight,
    Info,
    MapPin,
    CheckCircle,
    QrCode,
    LetterText,
    Download
} from "lucide-react"
import { fetchImage } from "../services/fetchImage"
import { Skeleton } from "../components/ui/skeleton"
import { imageValueToCss } from "ag-grid-community/dist/types/src/theming/theme-types"

function Detail() {
    const [inventoryItem, setInventoryItem] = useState<ItemDetailsProps>()
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [updatedData, setUpdatedData] = useState<{
        location: string
        status: string
    }>({ location: "", status: "" })
    const navigate = useNavigate()
    const { id } = useParams()
    const { token, userInfo } = useKeycloak()
    const isInventoryManager = userInfo?.groups?.includes("Inventory-Manager")

    const [photo, setPhoto] = useState<string | null>(null)

    const handleDownload = async (name: string, id: number | undefined) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_QR_HOST}/qr?name=${name} - ${id}&id=${id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/pdf"
                    }
                }
            )

            if (!response.ok) {
                console.log("... Fehler beim Download des QR-Codes:")
            }

            // Convert response to Blob
            const blob = await response.blob()

            // Create a temporary link to download the file
            const link = document.createElement("a")
            link.href = URL.createObjectURL(blob)
            link.download = `${name}-${id}-QRCode.pdf`

            // Programmatically click the link to trigger the download
            document.body.appendChild(link)
            link.click()

            // Clean up
            document.body.removeChild(link)
        } catch (error) {
            console.error("Error downloading QR code PDF:", error)
        }
    }

    const fetchItem = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/items/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.ok) {
                const data: ItemDetailsProps = await response.json()
                // Fetch image
                const image = await fetchImage(data.categoryId, token ?? "")
                setPhoto(image)
                setInventoryItem(data)
                setUpdatedData({
                    location: data.location || "",
                    status: data.status || ""
                })

                // Fetch QR Code
                if (data) await fetchQrCode(data.name)
            } else {
                CustomToasts.error({
                    message: "Dieses Exemplar existiert nicht.",
                    onClose: () => navigate(`/`)
                })
            }
        } catch (e) {
            console.log(e)
        }
        setLoading(false)
    }

    const fetchQrCode = async (name: string) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_QR_HOST}/qr?name=${name}-${id}&id=${id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "image/png"
                    }
                }
            )
            if (response.ok) {
                const blob = await response.blob()
                const reader = new FileReader()
                reader.onloadend = () => {
                    setQrCode(reader.result as string)
                }
                reader.readAsDataURL(blob)
            } else {
                console.error(
                    "Fehler beim Abrufen des QR-Codes. Status:",
                    response.status
                )
            }
        } catch (e) {
            console.log("... Fehler beim Abrufen des QR-Codes:", e)
        }
    }

    const handleSave = async () => {
        if (!inventoryItem) return

        const changes = {
            location: updatedData.location || inventoryItem.location,
            status: updatedData.status || inventoryItem.status
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories/${inventoryItem.categoryId}/items/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(changes)
                }
            )

            if (response.ok) {
                const updatedItem = await response.json()
                setInventoryItem(updatedItem)
                CustomToasts.success({
                    message: "Gegenstand erfolgreich aktualisiert!",
                    onClose: () => window.location.reload()
                })
            } else if (response.status === 404) {
                CustomToasts.error({
                    message: "Gegenstand nicht gefunden."
                })
            } else {
                CustomToasts.error({
                    message: "Fehler beim Aktualisieren des Gegenstands."
                })
            }
        } catch (error) {
            console.error("Fehler beim Speichern:", error)
            CustomToasts.error({
                message: "Fehler beim Aktualisieren des Gegenstands."
            })
        }
    }

    React.useEffect(() => {
        void fetchItem()
    }, [id])

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
                            <span>Inventargegenstand {inventoryItem?.id}</span>
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
                                    onClick={() =>
                                        navigate(
                                            `/category/${inventoryItem?.categoryId}`
                                        )
                                    }
                                >
                                    <ArrowLeft size={16} />
                                </Button>
                                <CardTitle className="ml-4 text-2xl font-bold flex items-center flex-wrap">
                                    <div className="mr-2">
                                        {loading ? (
                                            <Skeleton className="h-8 w-8 rounded-full bg-gray-200" />
                                        ) : (
                                            inventoryItem?.icon
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        {loading ? (
                                            <Skeleton className="h-8 w-[150px] md:w-[250px] max-w-full bg-gray-200" />
                                        ) : (
                                            inventoryItem?.name
                                        )}
                                    </div>
                                </CardTitle>
                            </div>
                            <div className="hidden md:flex mr-2">
                                <Button
                                    className="text-customBeige bg-customOrange hover:bg-orange-600 hover:text-customBeige"
                                    onClick={() =>
                                        navigate(`/item/${id}/reservation`)
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
                                    <div className="m-4 mb-4 space-y-10">
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
                                                ) : (
                                                    inventoryItem?.description
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row md:space-x-6">
                                            <div className="flex-1">
                                                <h2 className="text-md font-bold mb-4 flex items-center">
                                                    <MapPin className="mr-2 h-4 w-4 text-customOrange" />
                                                    Lagerort
                                                </h2>
                                                <div className="text-sm">
                                                    {loading ? (
                                                        <div className="space-y-4">
                                                            <Skeleton className="h-4 bg-gray-200 w-full max-w-[250px]" />
                                                        </div>
                                                    ) : isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={
                                                                updatedData.location
                                                            }
                                                            onChange={(e) =>
                                                                setUpdatedData({
                                                                    ...updatedData,
                                                                    location:
                                                                        e.target
                                                                            .value
                                                                })
                                                            }
                                                            className="border border-gray-300 rounded px-2 py-1 w-full"
                                                        />
                                                    ) : (
                                                        inventoryItem?.location
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-md font-bold mb-4 flex items-center mt-8 md:mt-0">
                                                    <CheckCircle className="mr-2 h-4 w-4 text-customOrange" />
                                                    Status
                                                </h2>
                                                <div className="text-sm">
                                                    {loading ? (
                                                        <div className="space-y-4">
                                                            <Skeleton className="h-4 bg-gray-200 w-full max-w-[250px]" />
                                                        </div>
                                                    ) : isEditing ? (
                                                        <select
                                                            value={
                                                                updatedData.status
                                                            }
                                                            onChange={(e) =>
                                                                setUpdatedData({
                                                                    ...updatedData,
                                                                    status: e
                                                                        .target
                                                                        .value
                                                                })
                                                            }
                                                            className="border border-gray-300 rounded px-2 py-1 w-full"
                                                        >
                                                            <option value="OK">
                                                                OK
                                                            </option>
                                                            <option value="LENT">
                                                                LENT
                                                            </option>
                                                            <option value="BROKEN">
                                                                BROKEN
                                                            </option>
                                                            <option value="IN_MAINTENANCE">
                                                                IN_MAINTENANCE
                                                            </option>
                                                            <option value="MAINTENANCE_REQUIRED">
                                                                MAINTENANCE_REQUIRED
                                                            </option>
                                                            <option value="LOST">
                                                                LOST
                                                            </option>
                                                        </select>
                                                    ) : (
                                                        inventoryItem?.status
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="">
                                            <h2 className="text-md font-bold mb-4 flex items-center">
                                                <QrCode className="mr-2 h-4 w-4 text-customOrange" />
                                                QR-Code
                                            </h2>
                                            <div className="flex flex-col items-center">
                                                {qrCode ? (
                                                    <img
                                                        src={qrCode}
                                                        alt="QR Code"
                                                        className="w-40 h-40 object-contain"
                                                    />
                                                ) : (
                                                    <Skeleton className="h-40 w-40 bg-gray-200" />
                                                )}

                                                <div
                                                    onClick={() =>
                                                        handleDownload(
                                                            inventoryItem?.name as string,
                                                            inventoryItem?.id
                                                        )
                                                    }
                                                    className="cursor-pointer text-customOrange text-sm hover:text-orange-300 mt-4 flex"
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    QR Code herunterladen
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center md:w-1/2 p-8 md:p-16 self-center w-full">
                                    {loading ? (
                                        <Skeleton className="h-[400px] bg-gray-200 w-full max-w-[400px]" />
                                    ) : (
                                        <img
                                            src={
                                                photo ||
                                                "/image-placeholder.jpg"
                                            }
                                            alt={inventoryItem?.name}
                                            className="object-cover rounded-lg w-full"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex md:hidden mr-2">
                                <Button
                                    className="text-customBeige bg-customOrange hover:bg-orange-600 hover:text-customBeige"
                                    onClick={() =>
                                        navigate(`/item/${id}/reservation`)
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

export default Detail
