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
import DatePickerField from "../components/DatePickerField"
import { toast } from "react-toastify"
import CustomToasts from "../components/CustomToasts"
import { DateInterval } from "react-day-picker"
import { ItemDetailsProps } from "../interfaces/ItemDetailsProps"
import { fetchImage } from "../services/fetchImage"
import { ArrowLeft, ArrowRight, Package } from "lucide-react"
import { Skeleton } from "../components/ui/skeleton"

function Lend() {
    const navigate = useNavigate()
    const [item, setItem] = useState<ItemDetailsProps>()
    const [unavailableDates, setUnavailableDates] = useState<DateInterval[]>([])
    const [endDateUnavailability, setEndDateUnavailability] = useState<any>()
    const { id } = useParams()
    const { token, userInfo } = useKeycloak()

    const [photo, setPhoto] = useState<string | null>(null)
    const [loadingImage, setLoadingImage] = useState(true)

    const fetchItem = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/items/${id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.ok) {
                const data = await response.json()
                // Fetch image
                const image = await fetchImage(data.categoryId, token ?? "")
                    .catch(() => "/image-placeholder.jpg")
                    .finally(() => setLoadingImage(false))
                setPhoto(image ?? "/image-placeholder.jpg")
                setItem(data)
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
                `${import.meta.env.VITE_RESERVATION_HOST}/availability/reservations/items/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.ok) {
                const data = await response.json()

                data.reservations.forEach(
                    (reservation: { startDate: Date; endDate: Date }) => {
                        // Date Start yesterday
                        const ds = new Date(reservation.startDate)
                        ds.setDate(ds.getDate() - 1)

                        // Day End + 1
                        const de = new Date(reservation.endDate)
                        de.setDate(de.getDate() + 1)

                        dateArray.push({
                            after: ds,
                            before: de
                        })
                    }
                )

                setUnavailableDates(dateArray)
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

    const updateEndDateUnavailability = () => {
        const selectedStartDate = new Date(
            form.getValues("startDate").getTime()
        )

        let possibleEndDate = new Date()
        possibleEndDate.setDate(possibleEndDate.getDate() + 365)

        unavailableDates.forEach((d) => {
            if (d.after < possibleEndDate && d.after >= selectedStartDate) {
                possibleEndDate = d.after
            }
        })

        selectedStartDate.setDate(selectedStartDate.getDate() + 1)

        // @ts-ignore
        if (possibleEndDate - form.getValues("startDate") === 0) {
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
        if (form.getValues("startDate")) {
            updateEndDateUnavailability()
        }
    }, [form.getValues("startDate")])

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
                `${import.meta.env.VITE_SPIFF}/api/v1.0/messages/Reservation_request_start`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        reservationrequests: [
                            {
                                startDate: formattedStartDate,
                                endDate: formattedEndDate,
                                itemId: Number(id),
                                userId: userInfo?.sub,
                                categoryId: item?.categoryId
                            }
                        ],
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
            {!!item && (
                <div className="max-w-[1440px] mx-auto">
                    <div className="m-8 lg:m-20">
                        <div className="mb-10">
                            <h1 className="text-3xl font-bold">
                                Reservierung anfragen
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Inventargegenstand {item.id}
                            </p>
                        </div>
                        <div>
                            <Card className="bg-white border-none drop-shadow-2xl">
                                <CardHeader className="mb-2 flex flex-row justify-between flex-wrap">
                                    <div className="flex items-center">
                                        <Button
                                            className="bg-customBlack text-white rounded-full hover:bg-customRed flex items-center justify-center w-[45px] h-[45px] p-0 shrink-0"
                                            onClick={() =>
                                                navigate(`/item/${id}`)
                                            }
                                        >
                                            <ArrowLeft size={16} />
                                        </Button>
                                        <CardTitle className="ml-6 text-2xl font-bold">
                                            {item.name} ausleihen
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
                                                        )
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
                                                        Zeitraum auswählen
                                                    </h4>
                                                    <div className="flex flex-wrap justify-center gap-y-8 pt-4 md:pt-8 pb-8">
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
                                                                    disabledDays={[
                                                                        {
                                                                            before: new Date()
                                                                        }
                                                                    ].concat(
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
                                                                )
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
                                            <Button
                                                onClick={() =>
                                                    navigate(
                                                        `/category/${item?.categoryId}/reservation`
                                                    )
                                                }
                                                className="mt-8 text-customOrange hover:text-orange-300"
                                            >
                                                Weitere Inventargegenstände dieser
                                                Art ausleihen
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
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
                                                        alt={item.name}
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

export default Lend
