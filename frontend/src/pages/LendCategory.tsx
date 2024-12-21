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
import { toast, ToastContainer } from "react-toastify"
import { CategoryProps } from "../interfaces/CategoryProps"
import DatePickerField from "../components/DatePickerField"
import { AvailabilityItemProps } from "../interfaces/AvailabilityItemProps"
import CustomToasts from "../components/CustomToasts"
import _ from "lodash"
import { Matcher } from "react-day-picker"

function LendCategory() {
    const [itemReservations, setItemReservations] = useState<AvailabilityItemProps[]>([])
    const [categoryItem, setCategoryItem] = useState<CategoryProps>()

    const [occurrences, setOccurrences] = useState<_.Dictionary<number>>()
    const [unavailableDates, setUnavailableDates] = useState<Matcher[]>([])
    const [endDateUnavailability, setEndDateUnavailability] = useState<any>()

    const navigate = useNavigate()
    const { id } = useParams()
    const { userInfo, token } = useKeycloak()

    const fetchCategory = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories/${id}`
            )
            if (response.ok) {
                const data = await response.json()
                setCategoryItem(data)
            } else {
                CustomToasts.error({
                    message: "Dieser Gegenstand existiert nicht.",
                    onClose: () => navigate(`/`)
                })
            }
        } catch (e) {
            CustomToasts.error({
                message: "Es ist etwas schiefgelaufen. Versuchen Sie es später erneut."
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
                `${import.meta.env.VITE_RESERVATION_HOST}/availability/reservations/categories/${id}`
            )
            if (response.ok) {
                const data: AvailabilityItemProps[] = await response.json()
                setItemReservations(data)
                const getDaysArray = function(
                    start: string | Date,
                    end: string | Date
                ) {
                    const arr = []
                    for (
                        const dt = new Date(start);
                        dt <= new Date(end);
                        dt.setDate(dt.getDate() + 1)
                    ) {
                        arr.push((new Date(dt)))
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
            } else {
                if (!toast.isActive("Die Verfügbarkeiten konnten nicht geladen werden")) {
                    CustomToasts.error({
                        message: "Die Verfügbarkeiten konnten nicht geladen werden"
                    })
                }
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
        const selectedStartDate = new Date(form.getValues('startDate').getTime())

        let possibleEndDate: Matcher = new Date()
        possibleEndDate.setDate(possibleEndDate.getDate()+365)

        unavailableDates.forEach((d) => {
            const date = d as Date
            if (date < possibleEndDate && date > selectedStartDate) {
                possibleEndDate = d
            }
        })


        selectedStartDate.setDate(form.getValues('startDate').getDate() + 1)
        possibleEndDate.setDate(possibleEndDate.getDate() - 1)

        // @ts-ignore
        if ((possibleEndDate - selectedStartDate) === 0) {
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
        let filterByQuantityLogic = _.pickBy(occurrences, (v, k) => v > ((categoryItem?.items.length ?? quantity) - quantity))
        setUnavailableDates(Object.keys(filterByQuantityLogic).map((el) => new Date(el)))
    }

    useEffect(() => {
        void fetchCategory()
        void fetchAvailability()
    }, [])

    useEffect(() => {
        void getUnavailableDatesByOccurrences()
    }, [form.getValues("quantity"), occurrences])

    useEffect(() => {
        if (form.getValues('startDate')) {
            updateEndDateUnavailability()
        }
    }, [form.getValues('startDate')])

    const onSubmit = async (values: FormschemaType) => {
        const { startDate, endDate, quantity } = values
        const formattedStartDate = format(
            startDate,
            "yyyy-MM-dd'T'HH:mm:ss'Z'"
        )
        const formattedEndDate = format(
            endDate,
            "yyyy-MM-dd'T'HH:mm:ss'Z'"
        )
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
                for (let j = 0; j < itemReservations[i].reservations.length; j++) {
                    const resStart = new Date(itemReservations[i].reservations[j].startDate)
                    const resEnd = new Date(itemReservations[i].reservations[j].endDate)
                    // Stop if unavailability of item found
                    if ((resStart <= startDate && resEnd >= startDate) || (resStart <= endDate && resEnd >= endDate)) {
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
                    body: JSON.stringify(jsonArray)
                }
            )

            if (response.ok) {
                CustomToasts.success({
                    message: "Reservierung erfolgreich! Sie werden nun weitergeleitet.",
                    onClose: () => navigate(`/reservations`)
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
                            errorMessage = "Unerwarteter Fehler. Bitte versuchen Sie es erneut."
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
            <ToastContainer />
            {!!categoryItem && (
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
                                                                <FormControl
                                                                    className="text-left font-sans w-[80px] pl-3">
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        onChange={(e) => {
                                                                            field.onChange(e.target.valueAsNumber)
                                                                            form.resetField('startDate')
                                                                            form.resetField('endDate')
                                                                        }}
                                                                        min={1}
                                                                        max={categoryItem?.items.length}
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
                                                            disabledDays={([
                                                                {
                                                                    before: new Date()
                                                                }
                                                            ] as Matcher[]).concat(unavailableDates)}
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
                                                                form.resetField('endDate')
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="endDate"
                                                    render={({ field }) => {
                                                        const startDate = form.getValues("startDate")
                                                        return (
                                                            <DatePickerField
                                                                label="Abgabedatum"
                                                                field={field}
                                                                disabledDays={endDateUnavailability}
                                                                defaultMonth={
                                                                    form.getValues(
                                                                        "endDate"
                                                                    ) ||
                                                                    startDate ||
                                                                    (() => {
                                                                        const tomorrow = new Date()
                                                                        tomorrow.setDate(tomorrow.getDate() + 1)
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
                                            <div className="flex justify-between items-center mt-4">
                                                <Button
                                                    onClick={() =>
                                                        navigate(
                                                            `/category/${id}`
                                                        )
                                                    }
                                                    className="flex bg-customBlue text-customBeige hover:bg-customRed hover:text-customBeige ml-8"
                                                >
                                                    &larr; Detail
                                                </Button>
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
                                                        (categoryItem?.items.length || 9999) < form.getValues("quantity")
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
