import * as React from 'react';
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { KeyValueRow } from "../components/KeyValueRow";

function Detail() {
    const [inventoryItem, setInventoryItem] = useState<InventoryItemProps>();
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);
    const { id } = useParams();

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

    React.useEffect(() => {
        void fetchItem();
    }, [fetchItem]);

    return (
        <div className="max-w-[800px] mx-auto">
            <CardHeader className="flex justify-self-auto mb-4 mt-4">
                <CardTitle className="text-customBlue col-span-2 justify-center flex"> {`${inventoryItem?.icon ?? ''}`} Detailansicht </CardTitle>
            </CardHeader>
            <div>
                <Card className="bg-white text-customBlack p-4 font-semibold">
                    <CardContent>
                        <div>
                            <div className="flex justify-between items-center mt-4">
                                <Button onClick={openModal} className="w-[100px] bg-customBlue text-customBeige rounded hover:bg-customRed">
                                    QR-Code
                                </Button>
                                <Button onClick={() => navigate(`/inventory-item/${id}/reservation`)} className="w-[100px] bg-customBlue text-customBeige hover:bg-customRed hover:text-customBeige">
                                    Ausleihen
                                </Button>
                            </div>
                            <div className="mt-6 border-t border-customOrange"></div>
                        </div>
                        {isOpen && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-customBeige rounded-lg shadow-lg p-6 w-96">
                                    <p className="text-center mb-4">{inventoryItem?.urn}</p>
                                    <button onClick={closeModal}
                                            className="mt-4 px-4 py-2 bg-customBlue text-white rounded hover:bg-customRed flex items-center justify-center">
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                        <dl className="divide-y divide-customOrange">
                            <KeyValueRow label="Name"> {inventoryItem?.name} </KeyValueRow>
                            <KeyValueRow label="Artikelnummer"> {id} </KeyValueRow>
                            <KeyValueRow label="Beschreibung"> {inventoryItem?.description} </KeyValueRow>
                            <KeyValueRow label="Foto">
                                {/*  Auskommentierten Code nach der Bearbeitung aktivieren  */}
                                {  /*!!inventoryItem?.photoUrl &&*/
                                    <img src={inventoryItem?.photoUrl} alt={inventoryItem?.description}
                                      className='w-full h-80 object-cover'/>}
                            </KeyValueRow>
                        </dl>
                        <div className="border-t border-customOrange"></div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => navigate('/')}
                                className="bg-customBlue text-customBeige hover:bg-customRed hover:text-customBeige">
                            &larr; Zurück
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default Detail;