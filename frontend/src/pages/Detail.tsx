import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import { Button } from "../components/ui/button";
import { KeyValueRow } from "../components/KeyValueRow";
import { useKeycloak } from "../keycloak/KeycloakProvider";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import pdfjsLib from "pdfjs-dist";

function Detail() {
    const [inventoryItem, setInventoryItem] = useState<InventoryItemProps>();
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedData, setUpdatedData] = useState<{ location: string; status: string }>({ location: "", status: "" });
    const navigate = useNavigate();
    const { id } = useParams();
    const { token } = useKeycloak();

    const fetchItem = React.useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_II_SERVICE_HOST}/items/${id}`);
            if (response.ok) {
                const data = await response.json();
                setInventoryItem(data);
                setUpdatedData({ location: data.location || "", status: data.status || "" }); // Set initial values
            }
        } catch (e) {
            console.log(e);
        }
    }, [id]);

    const fetchQrCode = React.useCallback(async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_II_QR_HOST}/qr?name=${inventoryItem?.name}&id=${id}`,
                {
                    method: "GET",
                    headers: {
                        "Output-Format": "PDF",
                    },
                }
            );
            if (response.ok) {
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    setQrCode(reader.result as string); // Base64-String des QR-Codes

                };
                reader.readAsDataURL(blob); // Umwandlung des Blobs in Base64
            } else {
                console.error("Fehler beim Abrufen des QR-Codes. Status:", response.status);
            }
        } catch (e) {
            console.log("... Fehler beim Abrufen des QR-Codes:", e);
        }
    }, [id, inventoryItem?.name]);


    const handleSave = async () => {
        if (!inventoryItem) return;

        const changes = {
            location: updatedData.location || inventoryItem.location,
            status: updatedData.status || inventoryItem.status,
        };

        try {
            const response = await fetch(
                `${process.env.REACT_APP_II_SERVICE_HOST}/categories/${inventoryItem.categoryId}/items/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(changes),
                }
            );

            if (response.ok) {
                const updatedItem = await response.json();
                setInventoryItem(updatedItem); // Update local state with new data
                toast.success("Item erfolgreich aktualisiert!");

                // Refresh the page to fetch updated data
                setTimeout(() => {
                    window.location.reload();
                }, 500); // Small delay for toast to be shown
            } else if (response.status === 404) {
                toast.error("Item nicht gefunden.");
            } else {
                toast.error("Fehler beim Aktualisieren des Items.");
            }
        } catch (error) {
            console.error("Fehler beim Speichern:", error);
            toast.error("Fehler beim Aktualisieren des Items.");
        }
    };

    React.useEffect(() => {
        void fetchItem();
    }, [fetchItem]);

    React.useEffect(() => {
        if (inventoryItem) {
            void fetchQrCode();
        }
    }, [inventoryItem, fetchQrCode]);

    return (
        <div className="max-w-[1000px] mx-auto">
            <ToastContainer />
            <CardHeader className="flex justify-self-auto mt-4">
                <CardTitle
                    className="text-3xl text-customOrange col-span-2 justify-center flex">
                    {`${inventoryItem?.icon ?? ""} ${inventoryItem?.name}`}
                </CardTitle>
            </CardHeader>
            <div className="p-4">
                <Card className="bg-white text-customBlack p-4 font-semibold">
                    <CardContent>
                        <div className="flex justify-between items-center mt-4">
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                className="bg-customBlue text-customBeige rounded hover:bg-customRed"
                            >
                                {isEditing ? "Bearbeitung abbrechen" : "Item bearbeiten"}
                            </Button>
                            <Button
                                onClick={() => navigate(`/inventory-item/${id}/reservation`)}
                                className="w-[130px] bg-customBlue text-customBeige rounded hover:bg-customRed hover:text-customBeige"
                            >
                                Ausleihen
                            </Button>
                        </div>

                        <dl className="divide-y divide-customBeige">
                            <KeyValueRow label="Kategorie ID"> {inventoryItem?.categoryId} </KeyValueRow>
                            <KeyValueRow label="Item ID"> {inventoryItem?.id} </KeyValueRow>
                            <KeyValueRow label="Beschreibung"> {inventoryItem?.description} </KeyValueRow>
                            <KeyValueRow label="Foto">
                                {!!inventoryItem?.photoUrl && (
                                    <img
                                        src={inventoryItem?.photoUrl}
                                        alt={inventoryItem?.description}
                                        className="w-full h-80 object-cover"
                                    />
                                )}
                            </KeyValueRow>
                            <KeyValueRow label="Lagerort">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={updatedData.location}
                                        onChange={(e) => setUpdatedData({ ...updatedData, location: e.target.value })}
                                        className="border border-gray-300 rounded px-2 py-1 w-full"
                                    />
                                ) : (
                                    inventoryItem?.location
                                )}
                            </KeyValueRow>
                            <KeyValueRow label="Status">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={updatedData.status}
                                        onChange={(e) => setUpdatedData({ ...updatedData, status: e.target.value })}
                                        className="border border-gray-300 rounded px-2 py-1 w-full"
                                    />
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
                            onClick={() => navigate(`/category/${inventoryItem?.categoryId}`)}
                            className="w-[130px] bg-customBlue text-customBeige rounded hover:bg-customRed"
                        >
                            &larr; Zurück
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

export default Detail;
