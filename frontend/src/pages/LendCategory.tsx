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
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { date, z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { KeyCloakUserInfo } from "../interfaces/KeyCloakUserInfo"
import { Input } from "../components/ui/input"
import { useToast } from "../hooks/use-toast"
import { Toaster } from "../components/ui/toaster"
import { CategoryProps } from "../interfaces/CategoryProps"
import DatePickerField from "../components/DatePickerField"
import { ToastWithCountdown } from "../components/ToastWithCountdown"

function LendCategory() {
    const [categoryItemsCount, setCategoryItemsCount] = useState<number>(1)
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [categoryItem, setCategoryItem] = useState<CategoryProps>()
    const [isStartPopoverOpen, setStartPopoverOpen] = useState(false)
    const [isEndPopoverOpen, setEndPopoverOpen] = useState(false)
    const [itemId, setItemId] = useState<[number] | []>([])
    const [categoryExists, setCategoryExists] = useState(false)
    const [unavailableDates, setUnavailableDates] = useState<Date[]>([])
    const navigate = useNavigate()
    const { toast } = useToast()
    const { id } = useParams()
    const { userInfo, token } = useKeycloak()

    const fetchCategory = React.useCallback(async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories/${id}`
            )
            if (response.ok) {
                setCategoryExists(true)
                const data = await response.json()
                setCategoryItem(data)
            } else {
                ToastWithCountdown(
                    "Fehlermeldung",
                    "Dieser Gegenstand existiert nicht. Bei Fragen melden Sie sich bei ihrem Administrator",
                    // TODO: Hier später zu reservations-page navigieren
                    () => navigate(`/`),
                    "destructive",
                    10000,
                    "#ffffff"
                )
            }
        } catch (e) {
            setErrorMessage(
                "Es ist etwas schiefgelaufen. Versuchen Sie es später erneut."
            )
            console.log(e)
        }
    }, [id])

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

    const fetchAvailability = React.useCallback(async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_RESERVATION_HOST}/availability/reservations/categories/${id}`
            )
            if (response.ok) {
                const data = await response.json()
                const quantity = form.getValues("quantity")
                let dateDisableArray: Date[] = []

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

                const reservationData: { [key: number]: Date[] } = {}
                let allDays: Date[] = []

                data.forEach(
                    (item: {
                        reservations: { startDate: string; endDate: string }[]
                        itemId: number
                    }) => {
                        item.reservations.forEach((reservation) => {
                            let day = getDaysArray(
                                reservation.startDate,
                                reservation.endDate
                            )
                            day.forEach((d) => {
                                if (!reservationData[item.itemId]) {
                                    reservationData[item.itemId] = []
                                }
                                allDays.push(d)
                                reservationData[item.itemId].push(d)
                            })
                        })
                    }
                )

                /*allDays.forEach((dayAll) => {
                    let count: number = 0
                    if (categoryItem?.items?.length) {
                        categoryItem.items.forEach((id: number) => {
                            reservationData[id].forEach((day: Date) => {
                                if (
                                    day.toDateString() === dayAll.toDateString()
                                ) {
                                    alert("Test")
                                    count += 1
                                }
                            })
                        })

                        if (quantity > categoryItem.items.length - count) {
                            dateDisableArray.push(dayAll)
                        }
                    }
                })*/

                setUnavailableDates(dateDisableArray)

                setItemId([])
            }
        } catch (e) {
            console.log(e)
            setErrorMessage("Die Verfügbarkeiten konnten nicht geladen werden")
        }
    }, [id])

    // const fetchAvailability = React.useCallback(async () => {
    //     try {
    //         const response = await fetch(`${process.env.REACT_APP_II_RESERVATION_HOST}/availability/reservations/categories/${id}`)
    //
    //         if (response.ok) {
    //             const data = await response.json()
    //             const quantity = form.getValues("quantity")
    //             let dateDisableArray: Date[] = []
    //
    //             const getDaysArray = function (start: string | Date, end: string | Date) {
    //                 const arr = []
    //                 for (const dt = new Date(start); dt <= new Date(end); dt.setDate(dt.getDate() + 1)) {
    //                     arr.push(new Date(dt))
    //                 }
    //                 return arr
    //             }
    //
    //             const reservationData: { [key: number]: Date[] } = {}
    //             let allDays: Date[] = []
    //
    //             alert("KCSAMOKA")
    //
    //             data.forEach((reservation: { startDate: Date; endDate: Date }) => {
    //                 let day = getDaysArray(reservation.startDate, reservation.endDate)
    //                 alert(reservation.startDate + "   -   " + itemId)
    //             })
    //
    //
    //             data.forEach((reservation: { startDate: Date; endDate: Date }, itemId: number) => {
    //                 if (!reservationData[itemId]) reservationData[itemId] = []
    //
    //                 let days = getDaysArray(reservation.startDate, reservation.endDate)
    //                 reservationData[itemId].push(...days)
    //                 allDays.push(...days)
    //             });
    //
    //             allDays.forEach(dayAll => {
    //                 let count: number = 0
    //                 if (categoryItem?.items?.length) {
    //                     categoryItem.items.forEach((id: any) => {
    //                         alert("Test2")
    //                         reservationData[id].forEach((day: Date) => {
    //                             if (day.toDateString() === dayAll.toDateString()) {
    //                                 alert("Test")
    //                                 count += 1
    //                             }
    //                         })
    //                     })
    //
    //                     if (quantity > (categoryItem.items.length - count)) {
    //                         dateDisableArray.push(dayAll)
    //                     }
    //                 }
    //             })
    //
    //             alert("Quantity: " + quantity + "----- Max Item: " + categoryItem?.items?.length + "----- Array: " + allDays)
    //
    //
    //             // Setze die deaktivierten Daten (für die Anzeige)
    //             setUnavailableDates(dateDisableArray)
    //
    //             // Hier kannst du die verfügbaren Items auflisten, wenn notwendig
    //
    //         }
    //     } catch (e) {
    //         console.error(e)
    //     }
    // }, [id])

    const isDateUnavailable = (date: Date) => {
        return unavailableDates.some(
            (dateArray) => dateArray.toDateString() === date.toDateString()
        )
    }

    useEffect(() => {
        if (form.getValues("startDate")) {
            const newStartDate = new Date(form.getValues("startDate"))
            newStartDate.setDate(newStartDate.getDate() + 1)
            setStartDate(newStartDate)
        }
        if (errorMessage) {
            toast({
                variant: "destructive",
                title: "Fehlermeldung",
                description: errorMessage,
                duration: Infinity
            })
        }
        setErrorMessage("")
        void fetchCategory()
    }, [fetchCategory, errorMessage, form.getValues("startDate")])

    const onSubmit = async (values: FormschemaType) => {
        const formattedStartDate = format(
            values.startDate,
            "yyyy-MM-dd'T'HH:mm:ss'Z'"
        )
        const formattedEndDate = format(
            values.endDate,
            "yyyy-MM-dd'T'HH:mm:ss'Z'"
        )
        const jsonArray: Array<{
            startDate: string
            endDate: string
            itemId: number
            userId: string | undefined
        }> = []
        itemId.forEach((id: number) => {
            jsonArray.push({
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                itemId: id,
                userId: userInfo?.sub
            })
        })

        try {
            const response = await fetch(
                `${import.meta.env.VITE_SPIFF}/api/v1.0/messages/Reservation-request-start`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(jsonArray)
                }
            )

            if (response.ok) {
                ToastWithCountdown(
                    "Reservierung erfolgreich",
                    `Sie werden auf ihre Reservierungsseite weitergeleitet`,
                    // TODO: Hier später zu reservations-page navigieren
                    () => navigate(`/`),
                    "default",
                    5000,
                    // TODO: Ändern zu accent von CustomTheme
                    "#F27428"
                )
            } else {
                const data = await response.json()
                switch (data.status) {
                    // TODO: Fehlermeldung für zu viele Gegenstände ausgewählt (Toast mit bitte weniger auswählen) und dann noch wenn submitted wird
                    case 400:
                        setErrorMessage(
                            `${categoryItem?.name} ist zu diesem Zeitraum nicht verfügbar.`
                        )
                        break
                    case 401:
                        setErrorMessage(
                            "Du hast nicht die benötigten Rechte um diesen Gegenstand auszuleihen."
                        )
                        break
                    case 403:
                        setErrorMessage("Zugriff verweigert.")
                        break
                    case 404:
                        setErrorMessage(
                            "Ressource nicht gefunden. Kontaktieren Sie den Administrator"
                        )
                        break
                    case 500:
                        setErrorMessage(
                            "Serverfehler: Ein Problem auf dem Server ist aufgetreten. Bitte versuchen Sie es später erneut."
                        )
                        break
                    default:
                        if (
                            data.message.includes(
                                "Item is already reserved for this time slot."
                            )
                        ) {
                            setErrorMessage(`${categoryItem?.name} ist in diesem Zeitpunkt keine ${form.getValues("quantity")}  
                            mal verfügbar. Bitte wählen Sie ein anderes Datum oder ändern Sie die Anzahl an Gegenständen.`)
                        } else {
                            setErrorMessage(
                                "Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut."
                            )
                        }
                        break
                }
            }
        } catch (error) {
            setErrorMessage(
                "Beim senden der Ausleihanfrage ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es später erneut."
            )
            console.error("Error message set:", errorMessage)
        }
    }

    return (
        <div>
            <Toaster />
            {categoryExists && (
                <div className="max-w-[600px] mx-auto">
                    <div className="p-4">
                        <CardHeader className="flex items-center text-customBlue">
                            <CardTitle className="mb-4">
                                Ausleihformular
                            </CardTitle>
                        </CardHeader>
                        <div className="max-w-[600px] mx-auto">
                            <Card>
                                <CardContent className="mt-4">
                                    <h3 className="text-center mb-4">
                                        {categoryItem?.name}
                                    </h3>
                                    <div className="flex justify-center mb-4">
                                        {!!categoryItem?.photoUrl && (
                                            <img
                                                src={categoryItem.photoUrl}
                                                alt={categoryItem.description}
                                                className="h-52 w-full object-contain"
                                            />
                                        )}
                                    </div>
                                    <Form {...form}>
                                        <form
                                            onSubmit={form.handleSubmit(
                                                onSubmit
                                            )}
                                            className="space-y-8"
                                        >
                                            <div className="text-sm text-gray-500 flex justify-center text-center">
                                                Bitte geben Sie zuerst die
                                                Anzahl ein.
                                            </div>
                                            <div className="flex flex-wrap justify-evenly">
                                                <FormField
                                                    control={form.control}
                                                    name="quantity"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <div className="flex flex-col sm:justify-center ml-8 mr-8">
                                                                <label className="text-sm pb-2">
                                                                    Anzahl
                                                                </label>
                                                                <FormControl className="text-left font-sans w-[80px] pl-3">
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            field.onChange(
                                                                                e
                                                                                    .target
                                                                                    .valueAsNumber
                                                                            )
                                                                            void fetchAvailability()
                                                                        }}
                                                                        min={1}
                                                                        max={
                                                                            categoryItem
                                                                                ?.items
                                                                                .length
                                                                        }
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="text-sm text-gray-500 flex justify-center text-center">
                                                Bitte geben Sie das Ausleih- und
                                                Abgabedatum ein.
                                            </div>
                                            <div className="flex flex-wrap justify-evenly gap-y-8">
                                                <FormField
                                                    control={form.control}
                                                    name="startDate"
                                                    render={({ field }) => (
                                                        <DatePickerField
                                                            label="Ausleihdatum"
                                                            field={field}
                                                            popoverOpen={
                                                                isStartPopoverOpen
                                                            }
                                                            setPopoverOpen={
                                                                setStartPopoverOpen
                                                            }
                                                            disabled={(date) =>
                                                                date <
                                                                    new Date() ||
                                                                isDateUnavailable(
                                                                    date
                                                                )
                                                            }
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
                                                            onClick={() => {
                                                                form.reset({
                                                                    startDate:
                                                                        form.getValues(
                                                                            "startDate"
                                                                        ),
                                                                    endDate:
                                                                        undefined,
                                                                    quantity:
                                                                        form.getValues(
                                                                            "quantity"
                                                                        )
                                                                })
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="endDate"
                                                    render={({ field }) => (
                                                        <DatePickerField
                                                            label="Abgabedatum"
                                                            field={field}
                                                            popoverOpen={
                                                                isEndPopoverOpen
                                                            }
                                                            setPopoverOpen={
                                                                setEndPopoverOpen
                                                            }
                                                            disabled={(date) =>
                                                                startDate
                                                                    ? date <
                                                                          startDate ||
                                                                      isDateUnavailable(
                                                                          date
                                                                      )
                                                                    : isDateUnavailable(
                                                                          date
                                                                      )
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
                                                    )}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center mt-4">
                                                <Button
                                                    onClick={() =>
                                                        navigate(
                                                            `/category/${id}`
                                                        )
                                                    }
                                                    className="flex bg-customBlue text-customBeige hover:bg-customRed hover:text-customBeige ml-8"
                                                >
                                                    &larr; Detailseite
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        undefined ==
                                                            form.getValues(
                                                                "startDate"
                                                            ) ||
                                                        undefined ==
                                                            form.getValues(
                                                                "endDate"
                                                            ) ||
                                                        0 ==
                                                            form.getValues(
                                                                "quantity"
                                                            ) ||
                                                        form.getValues(
                                                            "endDate"
                                                        ) <
                                                            form.getValues(
                                                                "startDate"
                                                            )
                                                        // TODO: Hier noch wenn anzahl > gesamtmenge
                                                    }
                                                    className="text-customBeige bg-customBlue mr-8 hover:bg-customRed hover:text-customBeige"
                                                >
                                                    Submit
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
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
