import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import { Button } from "../components/ui/button";
import { KeyValueRow } from "../components/KeyValueRow";
import { useKeycloak } from "../keycloak/KeycloakProvider";
import { TaskProps } from "../interfaces/TaskProps";
import { fetchOpenTasksByItemId } from "../services/fetchTasks";
import {CategoryDetailsProps} from "../interfaces/CategoryDetailsProps";
import {ColDef} from "ag-grid-community";
import CategoryDetailsTable from "../components/CategoryDetailsTable";

export const categoryColDefs: ColDef<CategoryDetailsProps>[] = [
    { headerName: "ID", field: "id", sortable: true, filter: "agNumberColumnFilter", flex: 1 },
    { headerName: "Status", field: "status", sortable: true, filter: "agNumberColumnFilter", flex: 1 },
    { headerName: "Lagerort", field: "location", sortable: true, filter: "agNumberColumnFilter", flex: 1 },
];

function CategoryDetails() {
    const [inventoryItem, setInventoryItem] = useState<InventoryItemProps>();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const openModal = (state: boolean) => setIsOpen(state);
    const { id } = useParams();
    const [tasksList, setTasksList] = React.useState<TaskProps[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [categoryDetails, setCategoryDetails] = useState<CategoryDetailsProps[]>([]);
    const [loading, setLoading] = React.useState(true);

    const { token } = useKeycloak();

    const fetchItems = React.useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_II_SERVICE_HOST}/categories/${id}`);
            if (response.ok) {
                const data = await response.json();
                setInventoryItem(data);
                setCategoryDetails(data.items || []);
            }
        } catch (e) {
            console.log(e);
        } finally {
        setLoading(false);
    }
    }, [id]);

    React.useEffect(() => {
        void fetchItems();
        //void fetchCategoryDetails()
    }, [fetchItems, id]);


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
                <CardTitle className="text-3xl text-customOrange col-span-2 justify-center flex">
                    {`${inventoryItem?.icon ?? ""} ${inventoryItem?.name}`}
                </CardTitle>
            </CardHeader>
            <div className="p-4">
                <Card className="bg-white text-customBlack p-4 font-semibold">
                    <CardContent>
                        {/* Buttons */}
                        <div>
                            <div className="flex justify-between items-center mt-4">
                                <Button
                                    onClick={() => navigate(`/inventory-item/${id}/reservation`)}
                                    className="w-[130px] bg-customBlue text-customBeige rounded hover:bg-customRed hover:text-customBeige"
                                >
                                    Ausleihen
                                </Button>
                            </div>
                        </div>
                        {isOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-customBeige rounded-lg shadow-lg p-6 w-96">
                                    <p className="text-center mb-4">{inventoryItem?.urn}</p>
                                    <button
                                        onClick={() => openModal(false)}
                                        className="mt-4 px-4 py-2 bg-customBlue text-white rounded hover:bg-customRed flex items-center justify-center"
                                    >
                                        Zurück
                                    </button>
                                </div>
                            </div>
                        )}

                        <dl className="divide-y divide-customBeige">
                            <KeyValueRow label="ID"> {id} </KeyValueRow>
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


                        </dl>

                        <div className="mt-6">
                            <h2 className="text-xl font-bold mb-4">Exemplare </h2>
                            <CategoryDetailsTable
                                categoryDetails={categoryDetails} colDefs={categoryColDefs} loading={loading}
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
    );
}

export default CategoryDetails;
