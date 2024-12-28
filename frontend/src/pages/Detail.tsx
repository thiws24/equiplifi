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
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { ToastContainer } from "react-toastify"
import CustomToasts from "../components/CustomToasts"

function Detail() {
    const [inventoryItem, setInventoryItem] = useState<InventoryItemProps>()
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

    const handleDownload = async (name: string, id: number | undefined) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_QR_HOST}/qr?name=${name} - ${id}&id=${id}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/pdf",
                    },
                }
            );

            if (!response.ok) {
                console.log("... Fehler beim Download des QR-Codes:")
            }

            // Convert response to Blob
            const blob = await response.blob();

            // Create a temporary link to download the file
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${name}-${id}-QRCode.pdf`;

            // Programmatically click the link to trigger the download
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading QR code PDF:", error);
        }
    };

    const fetchItem = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/items/${id}`
            )
            if (response.ok) {
                const data = await response.json()
                setInventoryItem(data)
                setUpdatedData({
                    location: data.location || "",
                    status: data.status || ""
                })

                // Fetch QR Code
                if (data) await fetchQrCode(data.name)
            } else {
                CustomToasts.error({
                    message: "Dieses Exemplar existiert nicht. Bei Fragen melden Sie sich bei ihrem Administrator.",
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
                    message: "Gegenstand nicht gefunden.",
                })
            } else {
                CustomToasts.error({
                    message: "Fehler beim Aktualisieren des Gegenstands.",
                })
            }
        } catch (error) {
            console.error("Fehler beim Speichern:", error)
            CustomToasts.error({
                message: "Fehler beim Aktualisieren des Gegenstands.",
            })
        }
    }

    React.useEffect(() => {
        void fetchItem()
    }, [id])

    return (
        <div className="max-w-[1000px] mx-auto">
            <ToastContainer />
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
                        <div className="flex justify-between items-center mt-4">
                            {isInventoryManager ? <Button
                                onClick={() => setIsEditing(!isEditing)}
                                className="bg-customBlue text-customBeige rounded hover:bg-customRed"
                            >
                                {isEditing
                                    ? "Bearbeitung abbrechen"
                                    : "Item bearbeiten"}
                            </Button> : <div/>}
                            <Button
                                onClick={() =>
                                    navigate(
                                        `/item/${id}/reservation`
                                    )
                                }
                                className="w-[130px] bg-customBlue text-customBeige rounded hover:bg-customRed hover:text-customBeige"
                            >
                                Ausleihen
                            </Button>
                        </div>

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
                                {!!inventoryItem?.photoUrl && (
                                    <img
                                        src={inventoryItem?.photoUrl}
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
                                    onClick={() => handleDownload(inventoryItem?.name as string, inventoryItem?.id)}

                                    className="cursor-pointer text-customBlue hover:text-customOrange mt-4 flex"
                                >
                                    QR Code herunterladen
                                </div>
                            </KeyValueRow>
                        </dl>

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
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={() =>
                                navigate(
                                    `/category/${inventoryItem?.categoryId}`
                                )
                            }
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

export default Detail
