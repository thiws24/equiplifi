import * as React from "react"
import CustomToasts from "./CustomToasts"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { Process } from "../interfaces/Process"
import { fetchAllProcessesByUser } from "../services/fetchProcesses"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ToastContainer } from "react-toastify"
import { UserReservationCard } from "./UserReservationCard"

interface Props {

}

export const UserReservationsList: React.FC<Props> = ({}) => {
    const [userProcesses, setUserProcesses] = React.useState<Process[]>([])
    const { token, userInfo } = useKeycloak()

    async function fetchUserProcesses() {
        try {
            const processes: Process[] = await fetchAllProcessesByUser(userInfo?.sub ?? "", token ?? "")
            setUserProcesses(processes)
            console.log(processes)
        } catch (e) {
            CustomToasts.error({
                message: "Es ist ein Fehler beim Laden der Reservierungen aufgetreten."
            })
        }
    }


    React.useEffect(() => {
        void fetchUserProcesses()
    }, [])

    return (
        <Card className="w-11/12 sm:w-4/5 mx-auto my-5 md:my-10 lg:my-20">
            <ToastContainer />
            <CardHeader>
                <CardTitle>Meine Reservierungen</CardTitle>
            </CardHeader>
            <CardContent>
                {userProcesses.map((cp) => <UserReservationCard
                    key={cp.id}
                    processId={cp.id}
                    data={cp.dataObject}
                />)
                }
            </CardContent>
        </Card>
    )
}