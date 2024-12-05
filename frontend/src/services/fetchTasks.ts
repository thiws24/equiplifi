import { fetchDataObjectFromProcess } from "./fetchDataObject"
import { TaskProps } from "../interfaces/TaskProps"

export async function fetchOpenTasksByItemId(
  itemId: number,
  token: string
): Promise<TaskProps[]> {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SPIFF}/api/v1.0/tasks`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    )
    if (response.ok) {
      const data = await response.json()
      return await filterTasksByItemId(data.results, itemId, token)
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
