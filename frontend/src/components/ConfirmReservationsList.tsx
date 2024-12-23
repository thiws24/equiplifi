import * as React from "react"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { TaskProps } from "../interfaces/TaskProps"
import { fetchOpenTasksByTaskName } from "../services/fetchTasks"
import CustomToasts from "./CustomToasts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { ToastContainer } from "react-toastify"
import { ConfirmReservationCard } from "./ConfirmReservationCard"


export const ConfirmReservationsList: React.FC = () => {
    const [confirmTasks, setConfirmTasks] = React.useState<TaskProps[]>([])
    const { token } = useKeycloak()

    async function fetchToConfirmProcesses() {
        try {
            const tasks: TaskProps[] = await fetchOpenTasksByTaskName(["Receive Inventory Manager confirmation"], token ?? "")
            setConfirmTasks(tasks)
        } catch (e) {
            CustomToasts.error({
                message: "Es ist ein Fehler beim Laden der Reservierungen aufgetreten."
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

    React.useEffect(() => {
        void fetchToConfirmProcesses()
    }, [])

    return (
        <Card className="w-11/12 sm:w-4/5 mx-auto my-5 md:my-10 lg:my-20">
            <ToastContainer />
            <CardHeader>
                <CardTitle>Reservierungen</CardTitle>
                <CardDescription>
                    Reservierungen, die bestätigt werden müssen
                </CardDescription>
            </CardHeader>
            <CardContent>
                {confirmTasks.map((cp) => <ConfirmReservationCard
                    key={cp.process_instance_id}
                    processId={cp.process_instance_id}
                    guid={cp.task_guid}
                    data={cp.dataObject}
                    onConfirmReservation={handleConfirmReservation} />)
                }
            </CardContent>
        </Card>
    )
}
