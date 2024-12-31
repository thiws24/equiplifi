import React from "react"
import CustomToasts from "../components/CustomToasts"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { Process } from "../interfaces/Process"
import {
    fetchAllProcessesByUser,
    fetchProcessesByLastMilestone
} from "../services/fetchProcesses"
import { ArrowRight, Info } from "lucide-react"
import { Card } from "../components/ui/card"
import { TaskProps } from "../interfaces/TaskProps"
import { fetchOpenTasksByTaskName } from "../services/fetchTasks"
import { useNavigate } from "react-router-dom"
import { UserReservationsList } from "../components/UserReservationsList"
import InventoryPreview from "../components/InventoryPreview"
import { ItemDetailsProps } from "../interfaces/ItemDetailsProps"

function Home() {
    const [loading, setLoading] = React.useState(true)
    const [reservations, setReservations] = React.useState<Process[]>([])

    const { keycloak, token, userInfo } = useKeycloak()

    const isInventoryManager = userInfo?.groups?.includes("Inventory-Manager")

    async function fetchReservations() {
        try {
            const processes: Process[] = await fetchAllProcessesByUser(
                userInfo?.sub ?? "",
                token ?? ""
            )
            setReservations(processes)
        } catch (e) {
            CustomToasts.error({
                message:
                    "Es ist ein Fehler beim Laden der Reservierungen aufgetreten."
            })
        }
        setLoading(false)
    }

    React.useEffect(() => {
        void fetchReservations()
        void fetchToConfirmProcesses()
        void fetchToReturnProcesses()
        void fetchInventoryItems()
    }, [])

    const [confirmTasks, setConfirmTasks] = React.useState<TaskProps[]>([])
    const [returnTasks, setReturnTasks] = React.useState<Process[]>([])

    async function fetchToConfirmProcesses() {
        try {
            const tasks: TaskProps[] = await fetchOpenTasksByTaskName(
                "Receive Inventory Manager confirmation",
                token ?? "",
                "reservationrequests"
            )
            setConfirmTasks(tasks)
        } catch (e) {
            CustomToasts.error({
                message:
                    "Es ist ein Fehler beim Laden der Reservierungen aufgetreten."
            })
        }
    }

    async function fetchToReturnProcesses() {
        try {
            const tasks: Process[] = await fetchProcessesByLastMilestone(
                "InventoryItem has been returned",
                token ?? "",
                "activereservations"
            )
            setReturnTasks(tasks)
        } catch (e) {
            CustomToasts.error({
                message:
                    "Es ist ein Fehler beim Laden der Rückgaben aufgetreten."
            })
        }
    }

    const firstName = keycloak.tokenParsed?.given_name || ""
    const username = keycloak.tokenParsed?.preferred_username || "User"

    const navigate = useNavigate()

    const [inventoryItems, setInventoryItems] = React.useState<
        ItemDetailsProps[]
    >([])

    const [inventoryLoading, setInventoryLoading] = React.useState(true)

    async function fetchInventoryItems() {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories`
            )
            if (response.ok) {
                const data = await response.json()
                setInventoryItems(data)
            }
        } catch (e) {
            CustomToasts.error({
                message:
                    "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut."
            })
            console.log(e)
        }
        setInventoryLoading(false)
    }

    return (
        <div className="max-w-[1440px] mx-auto">
            <div className="m-8 lg:m-20">
                <main className="main">
                    <h1 className="text-3xl font-bold mb-16">
                        Hallo,{" "}
                        <span className="text-customOrange">
                            {firstName || username}
                        </span>
                    </h1>

                    {isInventoryManager &&
                        (confirmTasks.length > 0 || returnTasks.length > 0) && (
                            <div className="mb-20">
                                {confirmTasks.length > 0 && (
                                    <Card
                                        className="p-2 flex items-center -mt-8 mb-4 bg-orange-400 bg-opacity-30 border-none cursor-pointer"
                                        onClick={() =>
                                            navigate("/reservations")
                                        }
                                    >
                                        <Info className="mr-3 text-customOrange h-5 w-5 shrink-0" />
                                        <p>
                                            <span className="font-bold">
                                                {confirmTasks.length}{" "}
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            confirmTasks.length >
                                                            1
                                                                ? "Reservierungs&shy;anfragen"
                                                                : "Reservierungs&shy;anfrage"
                                                    }}
                                                />
                                            </span>{" "}
                                            ausstehend
                                        </p>
                                        <button className="ml-auto flex items-center text-customOrange">
                                            <span className="mr-2">
                                                Ansehen
                                            </span>
                                            <ArrowRight />
                                        </button>
                                    </Card>
                                )}

                                {returnTasks.length > 0 && (
                                    <Card
                                        className="p-2 flex items-center mb-4 bg-orange-400 bg-opacity-30 border-none cursor-pointer"
                                        onClick={() =>
                                            navigate("/reservations")
                                        }
                                    >
                                        <Info className="mr-3 text-customOrange h-5 w-5 shrink-0" />
                                        <p>
                                            <span className="font-bold">
                                                {returnTasks.length}{" "}
                                                {returnTasks.length > 1
                                                    ? "Rückgaben"
                                                    : "Rückgabe"}
                                            </span>{" "}
                                            ausstehend
                                        </p>
                                        <button className="ml-auto flex items-center text-customOrange">
                                            <span className="mr-2">
                                                Ansehen
                                            </span>
                                            <ArrowRight />
                                        </button>
                                    </Card>
                                )}
                            </div>
                        )}

                    <InventoryPreview items={inventoryItems} />

                    {!isInventoryManager && <UserReservationsList />}
                </main>
            </div>
        </div>
    )
}

export default Home
