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
import { KeyCloakUserInfo } from "../interfaces/KeyCloakUserInfo"
import { ItemProps } from "../interfaces/ItemProps"
import DatePickerField from "../components/DatePickerField"
import { toast, ToastContainer } from "react-toastify"
import CustomToasts from "../components/CustomToasts"

function Lend() {
    const navigate = useNavigate()
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [itemExists, setItemExists] = useState(false)
    const [item, setItem] = useState<ItemProps>()
    const [userInfo, setUserInfo] = useState<KeyCloakUserInfo>()
    const [isStartPopoverOpen, setStartPopoverOpen] = useState(false)
    const [isEndPopoverOpen, setEndPopoverOpen] = useState(false)
    const [unavailableDates, setUnavailableDates] = useState<Date[][]>([])
    const { id } = useParams()
    const { keycloak, token } = useKeycloak()

    const fetchItem = React.useCallback(async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/items/${id}`
            )
            if (response.ok) {
                setItemExists(true)
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
    }, [id])

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

    const fetchAvailability = React.useCallback(async () => {
        try {
            let dateArray: Date[][] = []
            const response = await fetch(
                `${import.meta.env.VITE_RESERVATION_HOST}/availability/reservations/items/${id}`
            )
            if (response.ok) {
                const data = await response.json()
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

                data.reservations.forEach(
                    (reservation: { startDate: Date; endDate: Date }) => {
                        let day = getDaysArray(
                            reservation.startDate,
                            reservation.endDate
                        )
                        dateArray.push(day)
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
    }, [id])

    const isDateUnavailable = (date: Date) => {
        return unavailableDates.some((dateArray) =>
            dateArray.some(
                (unavailableDate) =>
                    unavailableDate.toDateString() === date.toDateString()
            )
        )
    }

    useEffect(() => {
        keycloak?.loadUserInfo().then(
            (val) => setUserInfo(val as any),
            (e) => console.log(e)
        )
        if (form.getValues("startDate")) {
            const newStartDate = new Date(form.getValues("startDate"))
            newStartDate.setDate(newStartDate.getDate() + 1)
            setStartDate(newStartDate)
        }
        void fetchItem()
        // TODO: Diese function soll nur aufgerufen werden, wenn der Monatsbutton geändert wird sonst nicht
        //  da sonst bei auswählen des startdates die fehlermeldung wieder kommt
        void fetchAvailability()
    }, [fetchItem, keycloak, form.getValues("startDate")])

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
                            userId: userInfo?.sub
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
            {itemExists && (
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
                                                                        undefined
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
                                                        navigate(`/item/${id}`)
                                                    }
                                                    className="flex bg-customBlue text-customBeige hover:bg-customRed hover:text-customBeige ml-8"
                                                >
                                                    &larr; Zurück
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
