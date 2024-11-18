import * as React from 'react';
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card";
import {useState} from "react";
import { Button } from "./ui/button";
import {KeyValueRow} from "./KeyValueRow";

export const DetailView: React.FC<InventoryItemProps> = ({ id, photoUrl, name, description, icon, urn }) => {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    // tmp for showcase purposes
    description = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt" +
        " ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et" +
        " ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."

    return (
        <Card className="bg-customBeige text-customBlack p-4 font-semibold">
            <CardHeader className="flex items-center">
                <CardTitle> {`${icon ?? 'x'}`} Detailansicht </CardTitle>
            </CardHeader>
            <div>
                <CardContent>
                    <div className="mt-6 border-t border-customOrange">
                        <dl className="divide-y divide-customOrange">
                            <KeyValueRow label="Name" value={name}/>
                            <KeyValueRow label="Artikelnummer" value={id}/>
                            <KeyValueRow label="Beschreibung" value={description}/>
                            <KeyValueRow label="Foto" value={ <img src={photoUrl} alt={description} className='w-full h-full object-cover'/> }/>
                            <KeyValueRow label="" value={ <button onClick={openModal} className="px-4 py-2 bg-customBlue text-customBeige rounded hover:bg-customRed"> Show QR-Code </button> } />
                            {isOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-customBeige rounded-lg shadow-lg p-6 w-96">
                                        <p className="text-center mb-4">{urn}</p>
                                        <button onClick={closeModal} className="mt-4 px-4 py-2 bg-customBlue
                                            text-white rounded hover:bg-customRed flex items-center justify-center"> Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </dl>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => navigate('/')} className="bg-customBlue text-customBeige hover:bg-customRed hover:text-customBeige"> &larr; Zurück </Button>
                </CardFooter>
            </div>
        </Card>
    )
}