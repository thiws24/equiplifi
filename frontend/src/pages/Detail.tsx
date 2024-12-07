import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import ReservationTable from "../components/ReservationTable";
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import { ReservationItemProps } from "../interfaces/ReservationItemProps";
import { Button } from "../components/ui/button";
import { KeyValueRow } from "../components/KeyValueRow";
import { ColDef } from "ag-grid-community";
import { fetchWaitingProcessesByTaskNameAndItemId } from "../services/fetchProcesses";
import { useKeycloak } from "../keycloak/KeycloakProvider";
import { ConfirmReservationCard } from "../components/ConfirmReservationCard";
import { TaskProps } from "../interfaces/TaskProps";
import { fetchOpenTasksByItemId } from "../services/fetchTasks";

export const rColDefs: ColDef<ReservationItemProps>[] = [
    {
        headerName: "Start Datum", field: "startDate", sortable: true, filter: "agSetColumnFilter", flex: 1
    },
    {
        headerName: "End Datum", field: "endDate", sortable: true, filter: "agSetColumnFilter", flex: 1
    }
];

function Detail() {
    const [inventoryItem, setInventoryItem] = useState<InventoryItemProps>();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const openModal = (state: boolean) => setIsOpen(state);
    const { id } = useParams();
    const [reservationItems, setReservationItems] = useState<ReservationItemProps[]>([]);
    const [reservationLoading, setReservationLoading] = React.useState(true);
    const [tasksList, setTasksList] = React.useState<TaskProps[]>([])
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    const { token } = useKeycloak()

    const handleFetchQRCode = async () => {
        setLoading(true);
        try {
            // API-URL mit Query-Params
            const response = await fetch(
                `https://qr.equipli.de/qr?name=${inventoryItem?.name}&id=$${id}`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/pdf",
                    },
                }
            );

            if (response.ok) {
                // PDF als Blob erhalten
                const blob = await response.blob();
                const pdfUrl = URL.createObjectURL(blob);

                // PDF in neuem Tab öffnen
                window.open(pdfUrl, "_blank");
            } else {
                console.error("Fehler beim Abrufen des QR-Codes:", response.statusText);
            }
        } catch (error) {
            console.error("Ein Fehler ist aufgetreten:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchItem = React.useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_II_SERVICE_HOST}/items/${id}`);
            if (response.ok) {
                const data = await response.json();
                setInventoryItem(data);
            }
        } catch (e) {
            console.log(e);
        }
    }, [id]);

    const fetchOpenTasks = React.useCallback(async () => {
        try {
            const tasks: TaskProps[] = await fetchOpenTasksByItemId(Number(id), token ?? '');
            setTasksList(tasks)
        } catch (e) {
            console.log(e);
        }
    }, [id]);

    const handleConfirmReservation = async (processId: number, guid: string) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_SPIFF}/api/v1.0/tasks/${processId}/${guid}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        lending: "confirmed"
                    }),
                }
            );

            if (response.ok) {
                // window.open(`/inventory-item/${id}`, '_self')
            } else {
                setErrorMessage(`HTTP Fehler! Status: ${response.status}`);
            }
        } catch (error) {
            setErrorMessage("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.")
            console.error('Error message set:', errorMessage);
        }
    };

    async function fetchReservationItems() {
        try {
            const response = await fetch(`${process.env.REACT_APP_II_RESERVATION_HOST}/reservations`);
            if (response.ok) {
                const data = await response.json();
                setReservationItems(data);
            }
        } catch (e) {
            console.log(e);
        }
        setReservationLoading(false);
    }

    React.useEffect(() => {
        void fetchItem();
        void fetchOpenTasks()
        void fetchReservationItems();
    }, [fetchItem, id]);

    return (
        <div className="max-w-[1000px] mx-auto">
            {errorMessage && (
                <div id="alert" role="alert" className="mt-4">
                    <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                        Fehlermeldung
                    </div>
                    <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                        <p>{errorMessage}</p>
                    </div>
                </div>
            )}
            <CardHeader className="flex justify-self-auto mt-4">
                <CardTitle
                    className="text-3xl text-customOrange col-span-2 justify-center flex"> {`${inventoryItem?.icon ?? ''} ${inventoryItem?.name}`} </CardTitle>
            </CardHeader>
            <div className="p-4">
                <Card className="bg-white text-customBlack p-4 font-semibold">
                    <CardContent>
                        {/* Button */}
                        <div>
                            <div className="flex justify-between items-center mt-4">
                                <Button onClick={() => openModal(true)}
                                        className="w-[130px] bg-customBlue text-customBeige rounded hover:bg-customRed hover:text-customBeige">
                                    QR Code zeigen
                                </Button>
                                <Button onClick={() => navigate(`/inventory-item/${id}/reservation`)}
                                        className="w-[130px] bg-customBlue text-customBeige rounded hover:bg-customRed hover:text-customBeige">
                                    Ausleihen
                                </Button>
                            </div>
                        </div>
                        {isOpen && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-customBeige rounded-lg shadow-lg p-6 w-96">
                                    <p className="text-center mb-4">{inventoryItem?.urn}</p>
                                    <button onClick={() => openModal(false)}
                                            className="mt-4 px-4 py-2 bg-customBlue text-white rounded hover:bg-customRed flex items-center justify-center">
                                        Zurück
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                            {tasksList.map((el) => (
                                <ConfirmReservationCard
                                    key={`process-${el.id}`}
                                    processId={el.process_instance_id}
                                    guid={el.task_guid}
                                    data={el.dataObject}
                                    onConfirmReservation={handleConfirmReservation}
                                />
                            ))}
                        </div>

                        <dl className="divide-y divide-customBeige">
                            <KeyValueRow label="ID"> {id} </KeyValueRow>
                            <KeyValueRow label="Beschreibung"> {inventoryItem?.description} </KeyValueRow>
                            <KeyValueRow label="Foto">
                                {!!inventoryItem?.photoUrl &&
                                    <img src={inventoryItem?.photoUrl} alt={inventoryItem?.description}
                                         className='w-full h-80 object-cover'/>}
                            </KeyValueRow>
                            <KeyValueRow label="Lagerort"> {inventoryItem?.location} </KeyValueRow>
                            <KeyValueRow label="Status"> {inventoryItem?.status} </KeyValueRow>
                            {/*
                            <div>
                                <h2 className="text-sm font-bold mb-4 mt-6">Reservierungen</h2>
                                <ReservationTable reservationItems={reservationItems} colDefs={rColDefs}
                                                  loading={reservationLoading}/>
                            </div>
                            */}
                        </dl>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => navigate(-1)}
                                className="w-[130px] bg-customBlue text-customBeige rounded hover:bg-customRed">
                        &larr; Zurück
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>

    )
}

export default Detail;