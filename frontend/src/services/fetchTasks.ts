import { fetchDataObjectFromProcess } from "./fetchDataObject"
import { TaskProps } from "../interfaces/TaskProps"
import { Process } from "../interfaces/Process"
import axios from "axios"
import { orderBy } from "lodash"

export async function fetchOpenTasksByTaskName(
    taskName: string,
    token: string,
    dataObjectName: 'reservations' | 'reservationrequests' | 'activereservations'
): Promise<TaskProps[]> {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_SPIFF}/api/v1.0/tasks`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        )
        if (response.ok) {
            const data = await response.json()

            // Filter tasks by a single task name
            let results = data.results.filter(
                (p: Process) =>
                    p.task_title?.toLowerCase() === taskName.toLowerCase()
            )

            results = orderBy(results, ['process_instance_id'], ['desc'])

            const filteredTasks: TaskProps[] = []

            // Fetch Data Object for each task
            await Promise.all(
                results.map(async (pItem: TaskProps) => {
                    const dataRes = await fetchDataObjectFromProcess(
                        pItem.process_instance_id,
                        token,
                        dataObjectName
                    )

                    let userName: string

                    if (dataRes) {
                        userName = await getUsername(dataRes[0].userId, token)
                        filteredTasks.push({
                            ...pItem,
                            userName,
                            dataObject: dataRes
                        })
                    }
                })
            )
            return filteredTasks
        }
    } catch (e) {
        console.log(e)
    }

    return []
}


async function getUsername(userId?: string, accessToken?: string): Promise<string> {
    if (!userId || !accessToken) return "Unbekannt"
    try {
        const response = await axios.get(
            `https://id.equipli.de/admin/realms/master/users/${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        return response.data.username
    } catch (error) {
        console.error("Fehler beim Abrufen des Benutzernamens:", error)
        return ""
    }
}