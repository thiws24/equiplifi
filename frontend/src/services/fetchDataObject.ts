import { ProcessInputProps } from "../interfaces/ProcessInputProps"

export async function fetchDataObjectFromProcess(
    processId: number,
    token: string
): Promise<ProcessInputProps | undefined> {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_SPIFF}/api/v1.0/process-data/default/equipli-processes:inventory-management-processes:reservation-to-return-process/reservationrequests/${processId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        )
        if (response.ok) {
            const dataObject = await response.json()
            return {...dataObject.process_data_value[0], count: dataObject.process_data_value.length}
        }
    } catch (e) {
        console.log(e)
    }

    return undefined
}
