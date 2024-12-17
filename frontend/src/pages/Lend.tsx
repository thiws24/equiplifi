import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Form, FormField } from "../components/ui/form"
import { Button } from "../components/ui/button"
import { format } from "date-fns"
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { ItemProps } from "../interfaces/ItemProps"
import DatePickerField from "../components/DatePickerField"
import { toast, ToastContainer } from "react-toastify"
import CustomToasts from "../components/CustomToasts"
import { DateInterval } from "react-day-picker"


function Lend() {
    const navigate = useNavigate()
    const [item, setItem] = useState<ItemProps>()
    const [unavailableDates, setUnavailableDates] = useState<DateInterval[]>([])
    const [endDateUnavailability, setEndDateUnavailability] = useState<any>()
    const { id } = useParams()
    const { token, userInfo } = useKeycloak()

    const fetchItem = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/items/${id}`
            )
            if (response.ok) {
                const data = await response.json()
                setItem(data)
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
            console.log(e)
        }
    }

    const FormSchema = z.object({
        startDate: z.date({
            required_error: "Startdatum erforderlich"
        }),
        endDate: z.date({
            required_error: "Enddatum erforderlich"
        })
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema)
    })

    type FormschemaType = z.infer<typeof FormSchema>

    const fetchItemAvailability = async () => {
        try {
            let dateArray: any[] = []
            const response = await fetch(
                `${import.meta.env.VITE_RESERVATION_HOST}/availability/reservations/items/${id}`
            )
            if (response.ok) {
                const data = await response.json()

                data.reservations.forEach(
                    (reservation: { startDate: Date; endDate: Date }) => {
                        // Date Start yesterday
                        const ds = new Date(reservation.startDate);
                        ds.setDate(ds.getDate() - 1)

                        // Day End + 1
                        const de = new Date(reservation.endDate);
                        de.setDate(de.getDate() + 1)

                        dateArray.push({
                            after: ds,
                            before: de,
                        })
                    }
                )

                setUnavailableDates(dateArray)
            } else {
                if (!toast.isActive("Die Verfügbarkeiten konnten nicht geladen werden")) {
                    CustomToasts.error({
                        message: "Die Verfügbarkeiten konnten nicht geladen werden",
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

    const updateEndDateUnavailability = () => {
        const selectedStartDate = new Date(form.getValues('startDate').getTime())

        let possibleEndDate = new Date()
        possibleEndDate.setDate(possibleEndDate.getDate()+365)

        unavailableDates.forEach((d) => {
            if (d.after < possibleEndDate && d.after >= selectedStartDate) {
                possibleEndDate = d.after
            }
        })

        selectedStartDate.setDate(selectedStartDate.getDate() + 1)

        // @ts-ignore
        if ((possibleEndDate - form.getValues('startDate')) === 0) {
            setEndDateUnavailability(true)
        } else {
            setEndDateUnavailability({
                before: selectedStartDate,
                after: possibleEndDate
            })
        }

    }

    useEffect(() => {
        void fetchItem()
        void fetchItemAvailability()
    }, [])

    useEffect(() => {
       if (form.getValues('startDate')) {
           updateEndDateUnavailability()
       }
    }, [form.getValues('startDate')])

    const onSubmit = async (values: FormschemaType) => {
        const formattedStartDate = format(
            values.startDate,
            "yyyy-MM-dd'T'HH:mm:ss'Z'"
        )
        const formattedEndDate = format(
            values.endDate,
            "yyyy-MM-dd'T'HH:mm:ss'Z'"
        )

        try {
            const response = await fetch(
                `${import.meta.env.VITE_SPIFF}/api/v1.0/messages/Reservation-request-start`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify([
                        {
                            startDate: formattedStartDate,
                            endDate: formattedEndDate,
                            itemId: Number(id),
                            userId: userInfo?.sub,
                            categoryId: item?.categoryId
                        }
                    ])
                }
            )
            if (response.ok) {
                CustomToasts.success({
                    message: "Reservierung erfolgreich! Sie werden nun weitergeleitet.",
                    onClose: () => navigate(`/`)
                })
            } else {
                const data = await response.json()
                let errorMessage: string = ""
                switch (data.status) {
                    case 400:
                        errorMessage = `${item?.name} ist zu diesem Zeitraum nicht verfügbar.`
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
                        errorMessage = "Ein Serverproblem ist aufgetreten."
                        break
                    default:
                        if (
                            data.message.includes(
                                "Item is already reserved for this time slot."
                            )
                        ) {
                            errorMessage = `${item?.name} zu diesem Zeitpunkt nicht verfügbar`
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
            {!!item && (
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
                                        {item?.name}
                                    </h3>
                                    <div className="flex justify-center mb-4">
                                        {!!item?.photoUrl && (
                                            <img
                                                src={item.photoUrl}
                                                alt={item.description}
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
                                                Bitte geben Sie die Anzahl, ein
                                                Ausleih- und Abgabedatum ein.
                                            </div>
                                            <div className="flex flex-wrap justify-evenly gap-y-8">
                                                <FormField
                                                    control={form.control}
                                                    name="startDate"
                                                    render={({ field }) => (
                                                        <DatePickerField
                                                            label="Ausleihdatum"
                                                            field={field}
                                                            disabledDays={[
                                                                {
                                                                    before: new Date()
                                                                }
                                                            ].concat(unavailableDates)}
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
                                                        const startDate = new Date(form.getValues("startDate"))
                                                        startDate.setDate(startDate.getDate() + 1)
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
                                                        navigate(`/item/${id}`)
                                                    }
                                                    className="flex bg-customBlue text-customBeige hover:bg-customRed hover:text-customBeige ml-8"
                                                >
                                                    &larr; Zurück
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        !form.getValues(
                                                                "startDate"
                                                            ) ||
                                                        !form.getValues(
                                                                "endDate"
                                                            )
                                                    }
                                                    className="text-customBeige bg-customBlue mr-8 hover:bg-customRed hover:text-customBeige"
                                                >
                                                    Submit
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                    <div
                                        onClick={() =>
                                            navigate(
                                                `/category/${item?.categoryId}/reservation`
                                            )
                                        }
                                        className="cursor-pointer text-customBlue hover:text-customOrange mt-4 flex justify-center"
                                    >
                                        Hier mehr ausleihen
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

export default Lend
