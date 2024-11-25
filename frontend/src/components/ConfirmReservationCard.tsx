import * as React from 'react';
import { ProcessInputProps } from "../interfaces/ProcessInputProps";


// TODO: Write the props you for this component
interface Props {
    processId: number
    data?: ProcessInputProps
}

export const ConfirmReservationCard: React.FC<Props> = ({ processId, data }) => {
    return (
        <div className='my-10'>
            {processId}
            <br/>
            {data?.startDate}
        </div>
    );
};