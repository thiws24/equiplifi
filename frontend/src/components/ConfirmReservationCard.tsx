import * as React from 'react';
import {ProcessInputProps} from "../interfaces/ProcessInputProps";


// TODO: Write the props you for this component
interface Props {
    processId: number;
    data?: ProcessInputProps;
    onConfirmReservation: (processId: number) => Promise<void>;
}

export const ConfirmReservationCard: React.FC<Props> = ({processId, data, onConfirmReservation}) => {

    const handleConfirm = async () => {
        await onConfirmReservation(processId);

    };

    const formatDate = (date: string | undefined): string => {
        if (!date) return '';
        const parsedDate = new Date(date);
        const day = String(parsedDate.getDate()).padStart(2, '0');
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const year = parsedDate.getFullYear();
        return `${day}.${month}.${year}`;
    };

    return (
        <div className="my-10 text-sm border p-4 rounded shadow-md">
            <p>Prozess-ID: {processId}</p>
            <p>Artikel-ID: {data?.InventoryItemId}</p>
            <p>Startddatum: {formatDate(data?.startDate)}</p>
            <p>Enddatum: {formatDate(data?.endDate)}</p>
            <button
                className="bg-customBlue text-customBeige text-sm px-4 py-2 rounded hover:bg-customRed"
                onClick={handleConfirm}
            >
                Reservierung Bestätigen
            </button>
        </div>
    );
};