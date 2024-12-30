import * as React from "react"
import CustomToasts from "./CustomToasts"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { Process } from "../interfaces/Process"
import { fetchAllProcessesByUser } from "../services/fetchProcesses"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { UserReservationCard } from "./UserReservationCard"
import { CalendarOff, Plus } from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import { useNavigate } from "react-router-dom"

interface Props {}

export const UserReservationsList: React.FC<Props> = ({}) => {
    const [userProcesses, setUserProcesses] = React.useState<Process[]>([])
    const { token, userInfo } = useKeycloak()
    const [loading, setLoading] = React.useState(true)
    const navigate = useNavigate()

    async function fetchUserProcesses() {
        try {
            const processes: Process[] = await fetchAllProcessesByUser(
                userInfo?.sub ?? "",
                token ?? ""
            )
            setUserProcesses(processes)
        } catch (e) {
            CustomToasts.error({
                message:
                    "Es ist ein Fehler beim Laden der Reservierungen aufgetreten."
            })
        }
        setLoading(false)
    }

    React.useEffect(() => {
        void fetchUserProcesses()
    }, [])

    return (
        <Card className="bg-white border-none drop-shadow-2xl my-10">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Meine Reservierungen</CardTitle>
                    <button
                        className="bg-customOrange hover:bg-orange-600 text-sm px-4 py-2 text-white ml-4 rounded inline-flex items-center"
                        onClick={() => navigate("/inventory")}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="ml-2 whitespace-nowrap hidden sm:flex">
                            Reservierung hinzufügen
                        </span>
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="space-y-4">
                        <Card className="flex flex-col space-y-4 p-4">
                            <Skeleton className="h-4 bg-gray-200 w-3/4" />
                            <Skeleton className="h-3 bg-gray-200 w-2/4" />
                            <Skeleton className="h-3 bg-gray-200 w-1/4" />
                            <Skeleton className="h-3 bg-gray-200 w-1/4" />
                        </Card>
                        <Card className="flex flex-col space-y-4 p-4">
                            <Skeleton className="h-4 bg-gray-200 w-3/4" />
                            <Skeleton className="h-3 bg-gray-200 w-2/4" />
                            <Skeleton className="h-3 bg-gray-200 w-1/4" />
                            <Skeleton className="h-3 bg-gray-200 w-1/4" />
                        </Card>
                    </div>
                )}

                {userProcesses.length === 0 && !loading && (
                    <div className="text-center mt-20 mb-20">
                        <CalendarOff className="w-8 h-8 text-gray-800 mx-auto mb-4" />
                        <p className="text-lg text-gray-800 mb-4">
                            Keine Reservierungen gefunden
                        </p>
                    </div>
                )}

                <div className="space-y-7">
                    {userProcesses.map((cp) => (
                        <UserReservationCard
                            key={cp.id}
                            processId={cp.id}
                            data={cp.dataObject}
                            taskTitle={cp.task_title}
                            lastMilestone={cp.last_milestone_bpmn_name}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
