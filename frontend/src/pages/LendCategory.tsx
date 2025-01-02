import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "../components/ui/form"
import { Button } from "../components/ui/button"
import { format } from "date-fns"
import React, { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { Input } from "../components/ui/input"
import { toast } from "react-toastify"
import { CategoryProps } from "../interfaces/CategoryProps"
import DatePickerField from "../components/DatePickerField"
import { AvailabilityItemProps } from "../interfaces/AvailabilityItemProps"
import CustomToasts from "../components/CustomToasts"
import _ from "lodash"
import { Matcher } from "react-day-picker"
import { fetchImage } from "../services/fetchImage"
import {
    ArrowLeft,
    ArrowRight,
    Minus,
    Package,
    Plus,
    Tally5
} from "lucide-react"
import { Arrow } from "@radix-ui/react-tooltip"
import { Skeleton } from "../components/ui/skeleton"

function LendCategory() {
    const [itemReservations, setItemReservations] = useState<
        AvailabilityItemProps[]
    >([])
    const [categoryItem, setCategoryItem] = useState<CategoryProps>()

    const [occurrences, setOccurrences] = useState<_.Dictionary<number>>()
    const [unavailableDates, setUnavailableDates] = useState<Matcher[]>([])
    const [endDateUnavailability, setEndDateUnavailability] = useState<any>()

    const [photo, setPhoto] = useState<string | null>(null)

    const navigate = useNavigate()
    const { id } = useParams()
    const { userInfo, token } = useKeycloak()

    const [loadingImage, setLoadingImage] = useState(true)

    const fetchCategory = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.ok) {
                const data: CategoryProps = await response.json()
                // Fetch image
                const image = await fetchImage(data.id, token ?? "")
                    .catch(() => "/image-placeholder.jpg")
                    .finally(() => setLoadingImage(false))
                setPhoto(image ?? "/image-placeholder.jpg")
                setCategoryItem(data)
            } else {
                CustomToasts.error({
                    message: "Dieser Gegenstand existiert nicht.",
                    onClose: () => navigate(`/`)
                })
            }
        } catch (e) {
            CustomToasts.error({
                message:
                    "Es ist etwas schiefgelaufen. Versuchen Sie es später erneut."
            })
        }
    }

    const FormSchema = z.object({
        quantity: z.number({}).min(1, "Anzahl muss größer als Null sein"),
        startDate: z.date({
            required_error: "Startdatum erforderlich"
        }),
        endDate: z.date({
            required_error: "Enddatum erforderlich"
        })
    })

    type FormschemaType = z.infer<typeof FormSchema>

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            quantity: 1
        }
    })

    const fetchAvailability = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_RESERVATION_HOST}/availability/reservations/categories/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.ok) {
                const data: AvailabilityItemProps[] = await response.json()
                setItemReservations(data)
                const getDaysArray = function (
                    start: string | Date,
                    end: string | Date
                ) {
                    const arr = []
                    for (
                        const dt = new Date(start);
                        dt <= new Date(end);
                        dt.setDate(dt.getDate() + 1)
                    ) {
                        arr.push(new Date(dt))
                    }
                    return arr
                }

                let allDays: Date[] = []

                data.forEach(
                    (item: {
                        reservations: { startDate: string; endDate: string }[]
                        itemId: number
                    }) => {
                        item.reservations.forEach((reservation) => {
                            let days = getDaysArray(
                                reservation.startDate,
                                reservation.endDate
                            )
                            allDays = allDays.concat(days)
                        })
                    }
                )
                setOccurrences(_.countBy(allDays))
            } else if (
                response.status !== 404 &&
                !toast.isActive(
                    "Die Verfügbarkeiten konnten nicht geladen werden"
                )
            ) {
                CustomToasts.error({
                    message: "Die Verfügbarkeiten konnten nicht geladen werden"
                })
            }
        } catch (e) {
            console.log(e)
            CustomToasts.error({
                message: "Es ist etwas schiefgelaufen."
            })
        }
    }

    // Unavailability of end date is calculated depending on chosen start date
    const updateEndDateUnavailability = () => {
        const selectedStartDate = new Date(
            form.getValues("startDate").getTime()
        )

        let possibleEndDate: Matcher = new Date()
        possibleEndDate.setDate(possibleEndDate.getDate() + 365)

        unavailableDates.forEach((d) => {
            const date = d as Date
            if (date < possibleEndDate && date > selectedStartDate) {
                possibleEndDate = d
            }
        })

        selectedStartDate.setDate(form.getValues("startDate").getDate() + 1)
        possibleEndDate.setDate(possibleEndDate.getDate() - 1)

        // @ts-ignore
        if (possibleEndDate - selectedStartDate === 0) {
            setEndDateUnavailability(true)
        } else {
            setEndDateUnavailability({
                before: selectedStartDate,
                after: possibleEndDate
            })
        }
    }

    const getUnavailableDatesByOccurrences = () => {
        const quantity = form.getValues("quantity")
        let filterByQuantityLogic = _.pickBy(
            occurrences,
            (v, k) => v > (categoryItem?.items.length ?? quantity) - quantity
        )
        setUnavailableDates(
            Object.keys(filterByQuantityLogic).map((el) => new Date(el))
        )
    }

    useEffect(() => {
        void fetchCategory()
        void fetchAvailability()
    }, [])

    useEffect(() => {
        void getUnavailableDatesByOccurrences()
    }, [form.getValues("quantity"), occurrences])

    useEffect(() => {
        if (form.getValues("startDate")) {
            updateEndDateUnavailability()
        }
    }, [form.getValues("startDate")])

    const onSubmit = async (values: FormschemaType) => {
        const { startDate, endDate, quantity } = values
        const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm:ss'Z'")
        const formattedEndDate = format(endDate, "yyyy-MM-dd'T'HH:mm:ss'Z'")
        const jsonArray: Array<{
            startDate: string
            endDate: string
            itemId: number
            userId: string | undefined
            categoryId: number
        }> = []

        for (let i = 0; i < itemReservations.length; i++) {
            // Stop, if number of desired items reached
            if (jsonArray.length === quantity) {
                break
            }
            if (!itemReservations[i].reservations.length) {
                jsonArray.push({
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                    itemId: itemReservations[i].itemId,
                    userId: userInfo?.sub,
                    categoryId: categoryItem!.id
                })
            } else {
                for (
                    let j = 0;
                    j < itemReservations[i].reservations.length;
                    j++
                ) {
                    const resStart = new Date(
                        itemReservations[i].reservations[j].startDate
                    )
                    const resEnd = new Date(
                        itemReservations[i].reservations[j].endDate
                    )
                    // Stop if unavailability of item found
                    if (
                        (resStart <= startDate && resEnd >= startDate) ||
                        (resStart <= endDate && resEnd >= endDate)
                    ) {
                        break
                    }

                    if (j === itemReservations[i].reservations.length - 1) {
                        jsonArray.push({
                            startDate: formattedStartDate,
                            endDate: formattedEndDate,
                            itemId: itemReservations[i].itemId,
                            userId: userInfo?.sub,
                            categoryId: categoryItem!.id
                        })
                    }
                }
            }
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_SPIFF}/api/v1.0/messages/Reservation_request_start`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        reservationrequests: jsonArray,
                        authentication: `Bearer ${token}`
                    })
                }
            )

            if (response.ok) {
                CustomToasts.success({
                    message:
                        "Reservierung erfolgreich! Sie werden nun weitergeleitet.",
                    onClose: () => window.open(`/reservations`, "_self")
                })
            } else {
                const data = await response.json()
                let errorMessage: string
                switch (data.status) {
                    case 400:
                        errorMessage = `${categoryItem?.name} ist zu diesem Zeitraum nicht verfügbar.`
                        break
                    case 401:
                        errorMessage = "Keine Berechtigungen."
                        break
                    case 403:
                        errorMessage = "Zugriff verweigert."
                        break
                    case 404:
                        errorMessage = "Ressource nicht gefunden."
                        break
                    case 500:
                        errorMessage = "Ein Serverproblem ist aufgetreten"
                        break
                    default:
                        if (
                            data.message.includes(
                                "Item is already reserved for this time slot."
                            )
                        ) {
                            errorMessage = `Zu diesem Zeitpunkt sind keine ${form.getValues("quantity")} Gegenstände verfügbar.`
                        } else {
                            errorMessage =
                                "Unerwarteter Fehler. Bitte versuchen Sie es erneut."
                        }
                        break
                }
                CustomToasts.error({
                    message: errorMessage
                })
            }
        } catch (error) {
            CustomToasts.error({
                message: "Ein Fehler ist eingetreten."
            })
            console.log("Error: " + error)
        }
    }

    return (
        <div>
            {!!categoryItem && (
                <div className="max-w-[1440px] mx-auto">
                    <div className="m-8 lg:m-20">
                        <div className="mb-10">
                            <h1 className="text-3xl font-bold">
                                Reservierung anfragen
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Kategorie {categoryItem.id}
                            </p>
                        </div>
                        <div>
                            <Card className="bg-white border-none drop-shadow-2xl">
                                <CardHeader className="mb-2 flex flex-row justify-between flex-wrap">
                                    <div className="flex items-center">
                                        <Button
                                            tooltip="Zurück"
                                            className="bg-customBlack text-white rounded-full hover:bg-customRed flex items-center justify-center w-[45px] h-[45px] p-0 shrink-0"
                                            onClick={() =>
                                                navigate(`/category/${id}`)
                                            }
                                        >
                                            <ArrowLeft size={16} />
                                        </Button>

                                        <CardTitle className="ml-4 text-2xl font-bold flex items-center flex-wrap">
                                            <div className="mr-2">
                                                {categoryItem.icon}
                                            </div>
                                            <div className="flex-1">
                                                {categoryItem.name}
                                            </div>
                                            <p className="ml-2">ausleihen</p>
                                        </CardTitle>
                                    </div>
                                    <div className="hidden md:flex">
                                        <Form {...form}>
                                            <form
                                                onSubmit={form.handleSubmit(
                                                    onSubmit
                                                )}
                                                className="space-y-8"
                                            >
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        !form.getValues(
                                                            "startDate"
                                                        ) ||
                                                        !form.getValues(
                                                            "endDate"
                                                        ) ||
                                                        0 ===
                                                            form.getValues(
                                                                "quantity"
                                                            ) ||
                                                        form.getValues(
                                                            "endDate"
                                                        ) <
                                                            form.getValues(
                                                                "startDate"
                                                            ) ||
                                                        (categoryItem?.items
                                                            .length || 9999) <
                                                            form.getValues(
                                                                "quantity"
                                                            )
                                                        // TODO: Hier noch wenn anzahl > gesamtmenge
                                                    }
                                                    className="text-customBeige bg-customOrange mr-8 hover:bg-orange-600 hover:text-customBeige"
                                                >
                                                    <Package
                                                        size={16}
                                                        className="mr-2"
                                                    />
                                                    Anfrage stellen
                                                    <ArrowRight
                                                        size={16}
                                                        className="ml-2"
                                                    />
                                                </Button>
                                            </form>
                                        </Form>
                                    </div>
                                </CardHeader>
                                <CardContent className="mt-0">
                                    <div className="flex flex-col-reverse md:flex-row items-start space-x-0 md:space-x-6 items-center my-2">
                                        <div className="flex flex-col items-center md:w-1/2">
                                            <Form {...form}>
                                                <form
                                                    onSubmit={form.handleSubmit(
                                                        onSubmit
                                                    )}
                                                    className="space-y-8"
                                                >
                                                    <h4 className="text-2xl text-center font-bold -mb-2 mt-4">
                                                        Anzahl
                                                    </h4>
                                                    <div className="flex flex-wrap items-center justify-center">
                                                        <FormField
                                                            control={
                                                                form.control
                                                            }
                                                            name="quantity"
                                                            render={({
                                                                field
                                                            }) => (
                                                                <FormItem className="flex flex-col">
                                                                    <div className="flex items-center sm:justify-center ml-8 mr-8">
                                                                        <button
                                                                            type="button"
                                                                            className="w-8 h-8 bg-customOrange text-white rounded-full flex items-center justify-center mr-2 disabled:opacity-35"
                                                                            onClick={() => {
                                                                                field.onChange(
                                                                                    Math.max(
                                                                                        1,
                                                                                        field.value -
                                                                                            1
                                                                                    )
                                                                                )
                                                                                form.resetField(
                                                                                    "startDate"
                                                                                )
                                                                                form.resetField(
                                                                                    "endDate"
                                                                                )
                                                                            }}
                                                                            disabled={
                                                                                field.value <=
                                                                                1
                                                                            }
                                                                        >
                                                                            <Minus
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        </button>
                                                                        <div className="flex flex-col items-center">
                                                                            <FormControl className="text-center font-sans w-[80px] pl-3 border-none">
                                                                                <Input
                                                                                    type="number"
                                                                                    id="quantity"
                                                                                    className="!text-center !text-3xl"
                                                                                    {...field}
                                                                                    onChange={(
                                                                                        e
                                                                                    ) => {
                                                                                        field.onChange(
                                                                                            e
                                                                                                .target
                                                                                                .valueAsNumber
                                                                                        )
                                                                                        form.resetField(
                                                                                            "startDate"
                                                                                        )
                                                                                        form.resetField(
                                                                                            "endDate"
                                                                                        )
                                                                                    }}
                                                                                    min={
                                                                                        1
                                                                                    }
                                                                                    max={
                                                                                        categoryItem
                                                                                            ?.items
                                                                                            .length
                                                                                    }
                                                                                />
                                                                            </FormControl>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            className="w-8 h-8 bg-customOrange text-white rounded-full flex items-center justify-center ml-2 disabled:opacity-35"
                                                                            onClick={() => {
                                                                                field.onChange(
                                                                                    field.value +
                                                                                        1
                                                                                )
                                                                                form.resetField(
                                                                                    "startDate"
                                                                                )
                                                                                form.resetField(
                                                                                    "endDate"
                                                                                )
                                                                            }}
                                                                            disabled={
                                                                                field.value >=
                                                                                categoryItem
                                                                                    ?.items
                                                                                    .length
                                                                            }
                                                                        >
                                                                            <Plus
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <h4 className="text-2xl text-center font-bold -mb-2 pt-12">
                                                        Zeitraum auswählen
                                                    </h4>
                                                    <div className="flex flex-wrap justify-center gap-y-8 pb-8">
                                                        <FormField
                                                            control={
                                                                form.control
                                                            }
                                                            name="startDate"
                                                            render={({
                                                                field
                                                            }) => (
                                                                <DatePickerField
                                                                    label="Ausleihdatum"
                                                                    field={
                                                                        field
                                                                    }
                                                                    disabledDays={(
                                                                        [
                                                                            {
                                                                                before: new Date()
                                                                            }
                                                                        ] as Matcher[]
                                                                    ).concat(
                                                                        unavailableDates
                                                                    )}
                                                                    defaultMonth={
                                                                        field.value ||
                                                                        (() => {
                                                                            const tomorrow =
                                                                                new Date()
                                                                            tomorrow.setDate(
                                                                                tomorrow.getDate() +
                                                                                    1
                                                                            )
                                                                            return tomorrow
                                                                        })()
                                                                    }
                                                                    onDayClick={() => {
                                                                        form.resetField(
                                                                            "endDate"
                                                                        )
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                        <FormField
                                                            control={
                                                                form.control
                                                            }
                                                            name="endDate"
                                                            render={({
                                                                field
                                                            }) => {
                                                                const startDate =
                                                                    form.getValues(
                                                                        "startDate"
                                                                    )
                                                                return (
                                                                    <DatePickerField
                                                                        label="Rückgabedatum"
                                                                        field={
                                                                            field
                                                                        }
                                                                        disabledDays={
                                                                            endDateUnavailability
                                                                        }
                                                                        defaultMonth={
                                                                            form.getValues(
                                                                                "endDate"
                                                                            ) ||
                                                                            startDate ||
                                                                            (() => {
                                                                                const tomorrow =
                                                                                    new Date()
                                                                                tomorrow.setDate(
                                                                                    tomorrow.getDate() +
                                                                                        1
                                                                                )
                                                                                return tomorrow
                                                                            })()
                                                                        }
                                                                        required={
                                                                            !!startDate
                                                                        }
                                                                        isDisabled={
                                                                            !startDate
                                                                        }
                                                                    />
                                                                )
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-center pt-8 md:hidden">
                                                        <Button
                                                            type="submit"
                                                            disabled={
                                                                !form.getValues(
                                                                    "startDate"
                                                                ) ||
                                                                !form.getValues(
                                                                    "endDate"
                                                                ) ||
                                                                0 ===
                                                                    form.getValues(
                                                                        "quantity"
                                                                    ) ||
                                                                form.getValues(
                                                                    "endDate"
                                                                ) <
                                                                    form.getValues(
                                                                        "startDate"
                                                                    ) ||
                                                                (categoryItem
                                                                    ?.items
                                                                    .length ||
                                                                    9999) <
                                                                    form.getValues(
                                                                        "quantity"
                                                                    )
                                                                // TODO: Hier noch wenn anzahl > gesamtmenge
                                                            }
                                                            className="text-customBeige bg-customOrange hover:bg-orange-600 hover:text-customBeige"
                                                        >
                                                            <Package
                                                                size={16}
                                                                className="mr-2"
                                                            />
                                                            Anfrage stellen
                                                            <ArrowRight
                                                                size={16}
                                                                className="ml-2"
                                                            />
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        </div>
                                        <div className="flex justify-center md:w-1/2 flex-wrap p-8 md:p-16">
                                            <div className="max-w-[400px]">
                                                {loadingImage ? (
                                                    <Skeleton className="h-[400px] w-[400px] rounded-lg bg-gray-200" />
                                                ) : (
                                                    <img
                                                        src={
                                                            photo ||
                                                            "/image-placeholder.jpg"
                                                        }
                                                        alt={categoryItem.name}
                                                        className=" object-cover rounded-lg"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LendCategory
