import * as React from "react"
import { useState } from "react"
import { ProcessDataValueProps } from "../interfaces/ProcessDataValueProps"
import { map } from "lodash"
import { Button } from "./ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog"
import {
    Calendar,
    CalendarCheck,
    CalendarX,
    ClipboardList,
    Info,
    List,
    PackageCheck,
    PackageOpen,
    Shuffle,
    Tag,
    Tally5,
    User
} from "lucide-react"
import { Card, CardContent, CardHeader } from "./ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@radix-ui/react-tooltip"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import CustomToasts from "./CustomToasts"
import { fetchImage } from "../services/fetchImage"
import { Skeleton } from "./ui/skeleton"

interface Props {
    processId: number
    data?: ProcessDataValueProps[]
    onConfirmReturn: (reservationId: number) => Promise<void>
}

export const ConfirmReturnCard: React.FC<Props> = ({
    processId,
    data,
    onConfirmReturn
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleReturn = () => {
        setIsModalOpen(true)
    }

    const handleConfirmModal = async () => {
        try {
            await Promise.all(
                map(data, (reservation) => {
                    return onConfirmReturn(reservation.id)
                })
            )

            setIsModalOpen(false)
        } catch (error) {
            console.error("Error confirming return", error)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }
    const itemIds: number[] = map(data, "itemId")
    const [loading, setLoading] = React.useState(true)
    const [loadingImage, setLoadingImage] = React.useState(true)
    const [image, setImage] = React.useState<string | null>(null)

    const [categoryDetails, setCategoryDetails] = React.useState<{
        name: string
        description: string
        icon: string
    }>({
        name: "",
        description: "",
        icon: ""
    })

    const categoryId = data ? (data[0]?.categoryId ?? null) : null
    const { token } = useKeycloak()

    const fetchCategory = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories/${categoryId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.ok) {
                const categoryDetails = await response.json()
                setCategoryDetails({
                    name: categoryDetails.name,
                    description: categoryDetails.description,
                    icon: categoryDetails.icon
                })
            } else {
                CustomToasts.error({
                    message:
                        "Details zu Rückgabe #" +
                        processId +
                        " konnten nicht geladen werden."
                })
            }
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    const fetchItemImage = async () => {
        try {
            if (categoryId !== null) {
                const fetchedImage = await fetchImage(categoryId, token ?? "")
                setImage(fetchedImage)
            } else {
                setImage("/image-placeholder.jpg")
            }
        } catch (error) {
            setImage("/image-placeholder.jpg")
        } finally {
            setLoadingImage(false)
        }
    }

    React.useEffect(() => {
        void fetchCategory()
        void fetchItemImage()
    }, [])

    return (
        <div>
            <Card className="p-4 relative">
                <CardHeader className="p-0 mb-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">
                            Rückgabe #{processId}
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
                                            categoryDetails.name
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2 text-customOrange" />
                                    <span className="font-semibold">
                                        Ausgeliehen von:
                                    </span>
                                    <span className="ml-2">
                                        {data ? data[0].userName : "-"}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Tally5 className="w-4 h-4 mr-2 text-customOrange" />
                                    <span className="font-semibold">
                                        Anzahl:
                                    </span>
                                    <span className="ml-2">{data?.length}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-0 flex flex-row gap-2 ml-auto self-end items-center flex-wrap mt-4 md:mt-0 justify-end">
                            <button
                                className="bg-customOrange text-white text-sm px-4 py-2 rounded hover:bg-orange-600 flex items-center justify-center"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <PackageCheck className="w-4 h-4 mr-2" />
                                Bestätigen
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rückgabe bestätigen</DialogTitle>
                        <DialogDescription>
                            Sind Sie sicher, dass die Rückgabe erfolgreich war?
                        </DialogDescription>
                    </DialogHeader>
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
                                    categoryDetails.name
                                )}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-customOrange" />
                            <span className="font-semibold">
                                Ausgeliehen von:
                            </span>
                            <span className="ml-2">
                                {data ? data[0].userName : "-"}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <Tally5 className="w-4 h-4 mr-2 text-customOrange" />
                            <span className="font-semibold">Anzahl:</span>
                            <span className="ml-2">{data?.length}</span>
                        </div>
                        <div className="flex items-center">
                            <ClipboardList className="w-4 h-4 mr-2 text-customOrange" />
                            <span className="font-semibold">Item IDs:</span>
                            <span className="ml-2">{itemIds.join(", ")}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <button
                            className="bg-customBlack text-white text-sm px-4 py-2 rounded hover:text-customOrange flex items-center"
                            onClick={handleCloseModal}
                        >
                            Abbrechen
                        </button>
                        <button
                            className="bg-customOrange text-white text-sm px-4 py-2 rounded hover:bg-orange-600 flex items-center"
                            onClick={handleConfirmModal}
                        >
                            Bestätigen
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
