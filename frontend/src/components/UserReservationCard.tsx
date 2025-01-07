import * as React from "react"
import { ProcessDataValueProps } from "../interfaces/ProcessDataValueProps"
import { map } from "lodash"
import { formatDate } from "../lib/formatDate"
import { PickUpScan } from "./PickUpScan"
import CustomToasts from "./CustomToasts";
import { useKeycloak } from "../keycloak/KeycloakProvider";
import { CategoryProps } from "../interfaces/CategoryProps";

interface Props {
    processId: number
    data?: ProcessDataValueProps[]
    taskTitle?: string
    lastMilestone?: string
}

export const UserReservationCard: React.FC<Props> = ({
    processId,
    data,
    taskTitle,
    lastMilestone
}) => {
    const itemIds: number[] = map(data, "itemId")
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const { token } = useKeycloak()
    const [category, setCategory] = React.useState<CategoryProps>()

    const fetchCategoryData = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories/${data![0]?.categoryId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.ok) {
                const categoryDetails = await response.json()
                setCategory(categoryDetails)
            } else {
                CustomToasts.error({
                    message:
                        "Details zu Reservierung #" +
                        processId +
                        " konnten nicht geladen werden."
                })
            }
        } catch (e) {
            console.log(e)
        }
    }

    React.useEffect(() => {
        void fetchCategoryData()
    }, [])

    return (
        <div className="space-y-7 text-sm border p-5 rounded shadow-md">
            <div className="grid grid-cols-[max-content_auto] gap-x-10 gap-y-1.5">
                <b>Prozess-ID:</b>
                <div>{processId}</div>
                <b>Kategorie-ID:</b>
                <div>{data ? data[0]?.categoryId : "-"}({category?.name})</div>
                <b>Anzahl:</b>
                <div>{data?.length}</div>
                <b>Startdatum:</b>
                <div>{data ? formatDate(data[0]?.startDate) : "-"}</div>
                <b>Enddatum:</b>
                <div>{data ? formatDate(data[0]?.endDate) : "-"}</div>
                <b>Item IDs:</b>
                <div>{itemIds.join(", ")}</div>
            </div>
            {taskTitle === "Receive Inventory Manager confirmation" && (
                <div className="italic">Warten auf Bestätigung</div>
            )}
            {lastMilestone === "InventoryItem has been returned" && (
                <div className="italic">Bereit für die Rückgabe</div>
            )}
            {lastMilestone === "Reservation successful" && !taskTitle && (
                <button
                    className="bg-customBlue text-customBeige text-sm px-4 py-2 rounded hover:bg-customRed"
                    onClick={() => setIsModalOpen(true)}
                >
                    Abholen
                </button>
            )}
            <PickUpScan
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                processId={processId}
                data={data}
            />
        </div>
    )
}
