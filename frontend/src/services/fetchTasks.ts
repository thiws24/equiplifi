import { fetchDataObjectFromProcess } from "./fetchDataObject"
import { TaskProps } from "../interfaces/TaskProps"
import { Process } from "../interfaces/Process"

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

            // TODO: Nach Prozess Id sortieren

            const filteredTasks: TaskProps[] = []

            // Fetch Data Object for each task
            await Promise.all(
                results.map(async (pItem: TaskProps) => {
                    const dataRes = await fetchDataObjectFromProcess(
                        pItem.process_instance_id,
                        token,
                        dataObjectName
                    )
                    filteredTasks.push({
                        ...pItem,
                        dataObject: dataRes
                    })
                })
            )
            return filteredTasks
        }
    } catch (e) {
        console.log(e)
    }

    return []
}


export async function fetchOpenTasksByLastMilestone(
    lastMilestone: string,
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
                    p.last_milestone_bpmn_name?.toLowerCase() === lastMilestone.toLowerCase()
            )

            const filteredTasks: TaskProps[] = []

            // Fetch Data Object for each task
            await Promise.all(
                results.map(async (pItem: TaskProps) => {
                    const dataRes = await fetchDataObjectFromProcess(
                        pItem.process_instance_id,
                        token,
                        dataObjectName
                    )
                    filteredTasks.push({
                        ...pItem,
                        dataObject: dataRes
                    })
                })
            )
            return filteredTasks
        }
    } catch (e) {
        console.log(e)
    }

    return []
}