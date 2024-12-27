import { fetchDataObjectFromProcess } from "./fetchDataObject"
import { TaskProps } from "../interfaces/TaskProps"
import { Process } from "../interfaces/Process"

export async function fetchOpenTasksByTaskName(
    taskName: string,
    token: string
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

            const filteredTasks: TaskProps[] = []

            // Fetch Data Object for each task
            await Promise.all(
                results.map(async (pItem: TaskProps) => {
                    const dataRes = await fetchDataObjectFromProcess(
                        pItem.process_instance_id,
                        token,
                        "reservationrequests"
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


export async function fetchOpenTasksToReturn(
    taskName: string,
    token: string
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

            const filteredTasks: TaskProps[] = []

            // Fetch Data Object for each task
            await Promise.all(
                results.map(async (pItem: TaskProps) => {
                    const dataRes = await fetchDataObjectFromProcess(
                        pItem.process_instance_id,
                        token,
                        "activereservations"
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

//Für Testzwecke:
export async function fetchAllTasks(token: string): Promise<TaskProps[]> {
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

            const allTasks: TaskProps[] = []

            // Fetch Data Object for each task
            await Promise.all(
                data.results.map(async (task: TaskProps) => {
                    const dataRes = await fetchDataObjectFromProcess(
                        task.process_instance_id,
                        token,
                        "activereservations"
                    )
                    allTasks.push({
                        ...task,
                        dataObject: dataRes
                    })
                })
            )

            return allTasks
        } else {
            console.error(`Failed to fetch tasks: ${response.status} ${response.statusText}`)
        }
    } catch (error) {
        console.error("An error occurred while fetching tasks:", error)
    }

    return []
}