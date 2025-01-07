import * as React from "react"
import { ProcessDataValueProps } from "../interfaces/ProcessDataValueProps"
import { map } from "lodash"
import { formatDate } from "../lib/formatDate"
import { PickUpScan } from "./PickUpScan"
import CustomToasts from "./CustomToasts";
import { useKeycloak } from "../keycloak/KeycloakProvider";
import { CategoryProps } from "../interfaces/CategoryProps";
import { Card, CardContent, CardHeader } from "./ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"
import { Calendar, CalendarCheck, CalendarX, ClipboardList, Info, PackageCheck, PackageOpen, Shuffle, Tag, Tally5, User, Warehouse } from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import CategoryDetails from "../pages/CategoryDetails"
import { fetchImage } from "../services/fetchImage"

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
    const [loadingImage, setLoadingImage] = React.useState(true)
    const [image, setImage] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(true)

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

                const fetchedImage = await fetchImage(categoryDetails.id, token ?? "")
                setImage(fetchedImage)
                setLoadingImage(false)

            } else {
                CustomToasts.error({
                    message:
                        "Details zu Reservierung #" +
                        processId +
                        " konnten nicht geladen werden."
                })
                setImage("/image-placeholder.jpg")
            }
            setLoading(false)
        } catch (e) {
            console.log(e)
            setImage("/image-placeholder.jpg")
        }
    }


    const calculateDays = (startDate: string, endDate: string): number => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const startDate = data ? data[0]?.startDate : null
    const endDate = data ? data[0]?.endDate : null
    const days = startDate && endDate ? calculateDays(startDate, endDate) : 0


    React.useEffect(() => {
        void fetchCategoryData()
    }, [])

    return (
        <div>
            <Card className="p-4 relative">
                <CardHeader className="p-0 mb-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">
                            Reservierung #{processId}
                        </h3>
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Info className="w-5 h-5 text-customOrange cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent
                                    className="bg-white p-4 rounded shadow-md border text-sm mb-1"
                                    style={{ whiteSpace: "pre-wrap" }}
                                >
                                    <div className="text-left space-y-2">
                                        <div className="flex items-center">
                                            <Shuffle className="w-4 h-4 mr-2 text-customOrange" />
                                            <b>Prozess-ID: </b> {processId}
                                        </div>
                                        <div className="flex items-center">
                                            <Tag className="w-4 h-4 mr-2 text-customOrange" />
                                            <b>Kategorie-ID: </b>{" "}
                                            {data ? data[0]?.categoryId : "-"}
                                        </div>
                                        <div className="flex items-center">
                                            <ClipboardList className="w-4 h-4 mr-2 text-customOrange" />
                                            <b>Item IDs: </b>{" "}
                                            {itemIds.join(", ")}
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
                <CardContent className="p-0 text-sm">
                    <div className="flex flex-col md:flex-row justify-between mb-2">
                        <div className="flex flex-col md:flex-row items-start md:items-center space-x-0 md:space-x-6">
                            <div className="flex items-center justify-center self-center mb-4 md:mb-0">
                                {loadingImage ? (
                                    <Skeleton className="w-24 h-24 rounded-full bg-gray-200" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gray-200">
                                        <img
                                            src={
                                                image ||
                                                "/image-placeholder.jpg"
                                            }
                                            className="w-24 h-24 rounded-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <PackageOpen className="w-4 h-4 mr-2 text-customOrange" />
                                    <span className="font-semibold">
                                        Inventargegenstand:
                                    </span>
                                    <span className="ml-2">
                                        {loading ? (
                                            <Skeleton className="w-24 h-2 rounded-lg bg-gray-200" />
                                        ) : (
                                            category?.name
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Tally5 className="w-4 h-4 mr-2 text-customOrange" />
                                    <span className="font-semibold">
                                        Anzahl:
                                    </span>
                                    <span className="ml-2">{data?.length}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-customOrange" />
                                    <span className="font-semibold">
                                        Zeitraum:
                                    </span>
                                    <span className="ml-2">
                                        {data
                                            ? formatDate(data[0]?.startDate)
                                            : "-"}{" "}
                                        -{" "}
                                        {data
                                            ? formatDate(data[0]?.endDate)
                                            : "-"}{" "}
                                        ({days} {days === 1 ? "Tag" : "Tage"})
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <ClipboardList className="w-4 h-4 mr-2 text-customOrange" />
                                    <span className="font-semibold mr-2">
                                        Status:
                                    </span>
                                    {taskTitle === "Receive Inventory Manager confirmation" && (
                                        <div className="italic">Warten auf Bestätigung durch Lagerwart</div>
                                    )}
                                    {lastMilestone === "InventoryItem has been returned" && (
                                        <div className="italic">Bereit für die Rückgabe</div>
                                    )}
                                    {lastMilestone === "Reservation successful" && !taskTitle && (
                                        <div className="italic">Bereit zur Abholung</div>

                                    )}
                                    <PickUpScan
                                        isModalOpen={isModalOpen}
                                        setIsModalOpen={setIsModalOpen}
                                        processId={processId}
                                        data={data}
                                    />
                                </div>
                                {lastMilestone === "Reservation successful" && !taskTitle && (
                                    <div className="flex items-center">
                                        <Warehouse className="w-4 h-4 mr-2 text-customOrange" />
                                        <span className="font-semibold">
                                        {category?.items && category.items.filter(item => data?.some(d => d?.itemId === item?.id))?.length > 1 ? "Lagerorte:" : "Lagerort:"}
                                        </span>
                                        <span className="ml-2">
                                            {category?.items
                                                .filter(item => data?.some(d => d.itemId === item.id))
                                                .map(item => item.location)
                                                .join(", ")}
                                        </span>
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="p-0 flex flex-row gap-2 ml-auto self-end items-center flex-wrap mt-4 md:mt-0 justify-end">
                            {lastMilestone === "Reservation successful" && !taskTitle && (
                                <button
                                    className="bg-customOrange text-white text-sm px-4 py-2 rounded hover:bg-orange-600 flex items-center justify-center"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <PackageCheck className="w-4 h-4 mr-2" />
                                    Abholen
                                </button>
                            )}

                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
