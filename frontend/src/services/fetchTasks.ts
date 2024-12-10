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

            let results = data.results.filter(
                (p: Process) => p.task_title?.toLowerCase() === taskName.toLowerCase()
            )

            const filteredTasks: TaskProps[] = []
            // Fetch Data Object for each task
            await Promise.all(
                results.map(async (pItem: TaskProps) => {
                    const dataRes = await fetchDataObjectFromProcess(
                        pItem.process_instance_id,
                        token
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

export async function filterTasksByItemId(
    data: TaskProps[],
    itemId: number,
    token: string
): Promise<TaskProps[]> {
    const filteredTasks: TaskProps[] = []
    // Fetch Data Object for each process
    await Promise.all(
        data.map(async (pItem) => {
            const dataRes = await fetchDataObjectFromProcess(
                pItem.process_instance_id,
                token
            )
            if (dataRes && dataRes.itemId === itemId) {
                filteredTasks.push({
                    ...pItem,
                    dataObject: dataRes
                })
            }
        })
    )

    return filteredTasks
}
