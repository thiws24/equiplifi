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
import { Process } from "../interfaces/Process";
import { useKeycloak } from "../keycloak/KeycloakProvider";
import { ConfirmReservationCard } from "../components/ConfirmReservationCard";

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
    const [processesList, setProcessesList] = React.useState<Process[]>([])

    const { token } = useKeycloak()

    const fetchItem = React.useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_II_SERVICE_HOST}/inventoryitems/${id}`);
            if (response.ok) {
                const data = await response.json();
                setInventoryItem(data);
            }
        } catch (e) {
            console.log(e);
        }
    }, [id]);

    const fetchWaitingProcesses = React.useCallback(async () => {
        try {
            const processes: Process[] = await fetchWaitingProcessesByTaskNameAndItemId("Confirm lending", Number(id), token ?? '');
            setProcessesList(processes)
        } catch (e) {
            console.log(e);
        }
    }, [id]);

    async function fetchReservationItems() {
        try {
            const response = await fetch(`${process.env.REACT_APP_II_RESERVATION_HOST}/reservations/${id}`);
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
        void fetchWaitingProcesses()
        void fetchReservationItems();
    }, [fetchItem, id]);

    return (
        <div className="max-w-[1000px] mx-auto">
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

                        {/* Processes to confirm */}
                        {/* TODO */}
                        <div>
                            {processesList.map(el => <ConfirmReservationCard key={`process-${el.id}`} processId={el.id} data={el.dataObject}/>)}
                        </div>
                        <dl className="divide-y divide-customBeige">
                            <KeyValueRow label="ID"> {id} </KeyValueRow>
                            <KeyValueRow label="Beschreibung"> {inventoryItem?.description} </KeyValueRow>
                            <KeyValueRow label="Foto">
                                { !!inventoryItem?.photoUrl &&
                                    <img src={inventoryItem?.photoUrl} alt={inventoryItem?.description}
                                         className='w-full h-80 object-cover'/>}
                            </KeyValueRow>
                        <div>
                            <h2 className="text-sm font-bold mb-4 mt-6">Reservierungen</h2>
                            <ReservationTable reservationItems={reservationItems} colDefs={rColDefs} loading={reservationLoading}/>
                        </div>
                        </dl>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => navigate('/')}
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