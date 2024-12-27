import { ProcessDataValueProps } from "../interfaces/ProcessDataValueProps"

interface DataObject {
    process_data_identifier: string
    process_data_value: ProcessDataValueProps[]
}

export async function fetchDataObjectFromProcess(
    processId: number,
    token: string,
    dataObject: 'reservations' | 'reservationrequests'
): Promise<ProcessDataValueProps[] | undefined> {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_SPIFF}/api/v1.0/process-data/default/equipli-processes:inventory-management-processes:reservation-to-return-process/${dataObject}/${processId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        )
        if (response.ok) {
            const dataObject: DataObject = await response.json()
            return dataObject.process_data_value
        }
    } catch (e) {
        console.log(e)
    }

    return undefined
}
