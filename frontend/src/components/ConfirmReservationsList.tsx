import * as React from "react"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { TaskProps } from "../interfaces/TaskProps"
import { fetchAllTasks, fetchOpenTasksByTaskName, fetchOpenTasksToReturn } from "../services/fetchTasks"
import CustomToasts from "./CustomToasts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { ToastContainer } from "react-toastify"
import { ConfirmReservationCard } from "./ConfirmReservationCard"
import { ConfirmReturnCard } from "./ConfirmReturnCard"

export const ConfirmReservationsList: React.FC = () => {
    const [confirmTasks, setConfirmTasks] = React.useState<TaskProps[]>([])
    const [returnTasks, setReturnTasks] = React.useState<TaskProps[]>([])
    const { token } = useKeycloak()

    async function fetchToConfirmProcesses() {
        try {
            const tasks: TaskProps[] = await fetchOpenTasksByTaskName("Receive Inventory Manager confirmation", token ?? "")
            setConfirmTasks(tasks)
        } catch (e) {
            CustomToasts.error({
                message: "Es ist ein Fehler beim Laden der Reservierungen aufgetreten."
            })
        }
    }

    async function fetchToReturnProcesses() {
        try {
            // TODO richtigen Task einfügen
            //const tasks: TaskProps[] = await fetchOpenTasksToReturn("Check-in inventoryItem", token ?? "")
            //Zum Testen: ohne Filterung auf bestimmten Task:
            const tasks: TaskProps[] = await fetchAllTasks(token ?? "")
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
                        reservation_confirmation: "returned"
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
        <div className="flex flex-col items-center space-y-8">
            <Card className="w-11/12 sm:w-4/5 mx-auto my-5 md:my-10 lg:my-20">
                <ToastContainer />
                <CardHeader>
                    <CardTitle>Anfragen</CardTitle>
                    <CardDescription>
                        Reservierungen, die bestätigt werden müssen.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {confirmTasks.map((cp) => (
                        <ConfirmReservationCard
                            key={cp.process_instance_id}
                            processId={cp.process_instance_id}
                            guid={cp.task_guid}
                            data={cp.dataObject}
                            onConfirmReservation={handleConfirmReservation}
                        />
                    ))}
                </CardContent>
            </Card>
            <Card className="w-11/12 sm:w-4/5 mx-auto my-5 md:my-10 lg:my-20">
                <CardHeader>
                    <CardTitle>Rückgaben</CardTitle>
                    <CardDescription>
                        Reservierungen, die zurückgegeben werden müssen.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {returnTasks.map((cp) => (
                        <ConfirmReturnCard
                            key={cp.process_instance_id}
                            processId={cp.process_instance_id}
                            guid={cp.task_guid}
                            onConfirmReturn={handleConfirmReturn}
                        />
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
