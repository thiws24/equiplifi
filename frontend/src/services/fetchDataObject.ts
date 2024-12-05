import { ProcessInputProps } from "../interfaces/ProcessInputProps"

export async function fetchDataObjectFromProcess(
  processId: number,
  token: string
): Promise<ProcessInputProps | undefined> {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SPIFF}/api/v1.0/process-data/default/equipli-processes:inventory-management-processes:reservation-to-return-process/reservationrequest/${processId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    )
    if (response.ok) {
      const dataObject = await response.json()
      return dataObject.process_data_value
    }
  } catch (e) {
    console.log(e)
  }

  return undefined
}
