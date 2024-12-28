import * as React from "react"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { TaskProps } from "../interfaces/TaskProps"
import { fetchOpenTasksByLastMilestone, fetchOpenTasksByTaskName } from "../services/fetchTasks"
import CustomToasts from "./CustomToasts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { ToastContainer } from "react-toastify"
import { ConfirmReservationCard } from "./ConfirmReservationCard"
import { ConfirmReturnCard } from "./ConfirmReturnCard"
import { fetchProcessesByLastMilestone } from "../services/fetchProcesses"
import { Process } from "../interfaces/Process"

export const InventoryManagerReservationsList: React.FC = () => {
    const [confirmTasks, setConfirmTasks] = React.useState<TaskProps[]>([])
    const [returnTasks, setReturnTasks] = React.useState<Process[]>([])
    const { token } = useKeycloak()

    async function fetchToConfirmProcesses() {
        try {
            const tasks: TaskProps[] = await fetchOpenTasksByTaskName("Receive Inventory Manager confirmation", token ?? "", "reservationrequests")
            setConfirmTasks(tasks)
        } catch (e) {
            CustomToasts.error({
                message: "Es ist ein Fehler beim Laden der Reservierungen aufgetreten."
            })
        }
    }

    async function fetchToReturnProcesses() {
        try {
            const tasks: Process[] = await fetchProcessesByLastMilestone("InventoryItem has been returned", token ?? "", "activereservations")
            setReturnTasks(tasks)
        } catch (e) {
            CustomToasts.error({
                message: "Es ist ein Fehler beim Laden der Rückgaben aufgetreten."
            })
        }
    }

    const handleConfirmReservation = async (
        processId: number,
        guid: string
    ) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_SPIFF}/api/v1.0/tasks/${processId}/${guid}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        reservation_confirmation: "confirmed"
                    })
                }
            )

            if (response.ok) {
                CustomToasts.success({
                    message: "Reservierung erfolgreich bestätigt.",
                    duration: 1000,
                    onClose: () => window.location.reload()
                })
            } else {
                CustomToasts.error({
                    message: "Es ist ein Fehler aufgetreten."
                })
            }
        } catch (error) {
            CustomToasts.error({
                message: "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut."
            })
        }
    }

    const handleConfirmReturn = async (
        reservationId: number
    ) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_SPIFF}/api/v1.0/messages/check_in_inventoryitem`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        reservation_id: reservationId,
                        check_in_status: "OK"
                    })
                }
            )

            if (response.ok) {
                CustomToasts.success({
                    message: "Rückgabe erfolgreich bestätigt.",
                    duration: 1000,
                    onClose: () => window.location.reload()
                })
            } else {
                CustomToasts.error({
                    message: "Es ist ein Fehler aufgetreten."
                })
            }
        } catch (error) {
            CustomToasts.error({
                message: "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut."
            })
        }
    }

    React.useEffect(() => {
        void fetchToConfirmProcesses()
        void fetchToReturnProcesses()
    }, [])

    return (
        <div className="flex flex-col items-center space-y-8 my-5 md:my-10 lg:my-20">
            <Card className="w-11/12 sm:w-4/5 mx-auto">
                <ToastContainer />
                <CardHeader>
                    <CardTitle>Anfragen</CardTitle>
                    <CardDescription>
                        Reservierungen, die bestätigt werden müssen.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-7'>
                        {confirmTasks.map((cp) => (
                            <ConfirmReservationCard
                                key={cp.process_instance_id}
                                processId={cp.process_instance_id}
                                guid={cp.task_guid}
                                data={cp.dataObject}
                                onConfirmReservation={handleConfirmReservation}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card className="w-11/12 sm:w-4/5 mx-auto">
                <CardHeader>
                    <CardTitle>Rückgaben</CardTitle>
                    <CardDescription>
                        Reservierungen, die zurückgegeben werden müssen.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {returnTasks.map((cp) => (
                        <ConfirmReturnCard
                            key={cp.id}
                            processId={cp.id}
                            data={cp.dataObject}
                            onConfirmReturn={handleConfirmReturn}
                        />
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
