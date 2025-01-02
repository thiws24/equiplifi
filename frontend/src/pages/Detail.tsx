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
import { Pencil, PencilOff, Save, ArrowLeft } from "lucide-react"
import { fetchImage } from "../services/fetchImage"

function Detail() {
    const [inventoryItem, setInventoryItem] = useState<ItemDetailsProps>()
    const [qrCode, setQrCode] = useState<string | null>(null)
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
        <div className="max-w-[1000px] mx-auto">
            <CardHeader className="flex justify-self-auto mt-4">
                <CardTitle className="text-3xl text-customOrange col-span-2 flex flex-col items-center justify-center">
                    {`${inventoryItem?.icon ?? ""} ${inventoryItem?.name}`}
                    <span className="text-lg text-customOrange font-semibold items-center mt-2">
                        Item {`${inventoryItem?.id ?? ""}`}
                    </span>
                </CardTitle>
            </CardHeader>
            <div className="p-4">
                <Card className="bg-white text-customBlack p-4 font-semibold">
                    <CardContent>
                        <div className="flex justify-end items-center mt-4"></div>
                        {isInventoryManager ? (
                            <Button
                                tooltip={editButtonTooltipText}
                                onClick={() => setIsEditing(!isEditing)}
                                className="fixed top-16 right-5 w-[55px] h-[55px] z-10 bg-customOrange text-customBeige rounded-full hover:bg-customRed"
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
                                onClick={() =>
                                    navigate(`/item/${id}/reservation`)
                                }
                                className="w-[100px] bg-customBlue text-customBeige rounded hover:bg-customRed hover:text-customBeige"
                            >
                                Ausleihen
                            </Button>
                        </div>
                        <div className="mb-8"></div>

                        <dl className="divide-y divide-customBeige">
                            <KeyValueRow label="Kategorie ID">
                                {" "}
                                {inventoryItem?.categoryId}{" "}
                            </KeyValueRow>
                            <KeyValueRow label="Item ID">
                                {" "}
                                {inventoryItem?.id}{" "}
                            </KeyValueRow>
                            <KeyValueRow label="Beschreibung">
                                {" "}
                                {inventoryItem?.description}{" "}
                            </KeyValueRow>
                            <KeyValueRow label="Foto">
                                {!!photo && (
                                    <img
                                        src={photo}
                                        alt={inventoryItem?.description}
                                        className="w-full h-80 object-contain"
                                    />
                                )}
                            </KeyValueRow>
                            <KeyValueRow label="Lagerort">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={updatedData.location}
                                        onChange={(e) =>
                                            setUpdatedData({
                                                ...updatedData,
                                                location: e.target.value
                                            })
                                        }
                                        className="border border-gray-300 rounded px-2 py-1 w-full"
                                    />
                                ) : (
                                    inventoryItem?.location
                                )}
                            </KeyValueRow>
                            <KeyValueRow label="Status">
                                {isEditing ? (
                                    <select
                                        value={updatedData.status}
                                        onChange={(e) =>
                                            setUpdatedData({
                                                ...updatedData,
                                                status: e.target.value
                                            })
                                        }
                                        className="border border-gray-300 rounded px-2 py-1 w-full"
                                    >
                                        <option value="OK">OK</option>
                                        <option value="LENT">LENT</option>
                                        <option value="BROKEN">BROKEN</option>
                                        <option value="IN_MAINTENANCE">
                                            IN_MAINTENANCE
                                        </option>
                                        <option value="MAINTENANCE_REQUIRED">
                                            MAINTENANCE_REQUIRED
                                        </option>
                                        <option value="LOST">LOST</option>
                                    </select>
                                ) : (
                                    inventoryItem?.status
                                )}
                            </KeyValueRow>
                            <KeyValueRow label="QR Code">
                                {qrCode ? (
                                    <img
                                        src={qrCode}
                                        alt="QR Code"
                                        className="w-40 h-40 object-contain"
                                    />
                                ) : (
                                    "Laden..."
                                )}
                                <div
                                    onClick={() =>
                                        handleDownload(
                                            inventoryItem?.name as string,
                                            inventoryItem?.id
                                        )
                                    }
                                    className="cursor-pointer text-customBlue hover:text-customOrange mt-4 flex"
                                >
                                    QR Code herunterladen
                                </div>
                            </KeyValueRow>
                        </dl>

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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Detail
