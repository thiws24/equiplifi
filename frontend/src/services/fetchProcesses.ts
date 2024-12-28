import { Process } from "../interfaces/Process"
import { fetchDataObjectFromProcess } from "./fetchDataObject"

const reportMetadataColumns = [
    {
        Header: "Id",
        accessor: "id",
        filterable: false
    },
    {
        Header: "Process",
        accessor: "process_model_display_name",
        filterable: false
    },
    {
        Header: "Task",
        accessor: "task_title",
        filterable: false
    },
    {
        Header: "Start",
        accessor: "start_in_seconds",
        filterable: false
    },
    {
        Header: "End",
        accessor: "end_in_seconds",
        filterable: false
    },
    {
        Header: "Started by",
        accessor: "process_initiator_username",
        filterable: false
    },
    {
        Header: "Last milestone",
        accessor: "last_milestone_bpmn_name",
        filterable: false
    },
    {
        Header: "Status",
        accessor: "status",
        filterable: false
    },
    {
        Header: "Waiting for",
        accessor: "waiting_for",
        filterable: false
    }
]

export async function fetchAllProcessesByUser(
    userId: string,
    token: string
): Promise<Process[]> {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_SPIFF}/api/v1.0/process-instances`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    report_metadata: {
                        columns: reportMetadataColumns,
                        filter_by: [
                            {
                                field_name: "process_status",
                                field_value: "user_input_required,waiting",
                                operator: "equals"
                            },
                            {
                                field_name: "with_oldest_open_task",
                                field_value: true,
                                operator: "equals"
                            }
                        ],
                        order_by: ["-start_in_seconds", "-id"]
                    }
                })
            }
        )

        if (response.ok) {
            const data = await response.json()

            const filteredProcesses: Process[] = []

            // Add data object
            await Promise.all(
                data.results.map(async (pItem: Process) => {
                    const dataRes = await fetchDataObjectFromProcess(pItem.id, token, 'reservations')
                    if (dataRes && dataRes[0].userId === userId) {
                        filteredProcesses.push({
                            ...pItem,
                            dataObject: dataRes
                        })
                    }
                })
            )
            return filteredProcesses
        }
    } catch (e) {
        console.log(e)
    }
    return []
}


export async function fetchProcessesByLastMilestone(
    lastMilestone: string,
    token: string,
    dataObjectName: 'reservations' | 'reservationrequests' | 'activereservations'
): Promise<Process[]> {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_SPIFF}/api/v1.0/process-instances`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    report_metadata: {
                        columns: reportMetadataColumns,
                        filter_by: [
                            {
                                field_name: "process_status",
                                field_value: "user_input_required,waiting",
                                operator: "equals"
                            },
                            {
                                field_name: "with_oldest_open_task",
                                field_value: true,
                                operator: "equals"
                            }
                        ],
                        order_by: ["id"]
                    }
                })
            }
        )

        if (response.ok) {
            const data = await response.json()

            const filteredProcesses: Process[] = []
            // Filter processes by a last milestone
            let results = data.results.filter(
                (p: Process) =>
                    p.last_milestone_bpmn_name?.toLowerCase() === lastMilestone.toLowerCase()
            )

            // Add data object
            await Promise.all(
                results.map(async (pItem: Process) => {
                    const dataRes = await fetchDataObjectFromProcess(pItem.id, token, dataObjectName)
                    filteredProcesses.push({
                        ...pItem,
                        dataObject: dataRes
                    })
                })
            )
            return filteredProcesses
        }
    } catch (e) {
        console.log(e)
    }
    return []
}
