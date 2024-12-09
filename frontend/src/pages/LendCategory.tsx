import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card"
import {Form, FormControl, FormDescription, FormField, FormItem, FormMessage} from "../components/ui/form"
import {Popover, PopoverContent, PopoverTrigger} from "../components/ui/popover"
import {Button} from "../components/ui/button"
import {cn} from "../lib/utils"
import {format} from "date-fns"
import {CalendarIcon} from "lucide-react"
import {Calendar} from "../components/ui/calendar"
import React, {useEffect, useState} from "react"
import {InventoryItemProps} from "../interfaces/InventoryItemProps"
import {useNavigate, useParams} from "react-router-dom"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useKeycloak} from "../keycloak/KeycloakProvider"
import {KeyCloakUserInfo} from "../interfaces/KeyCloakUserInfo"
import {Input} from "../components/ui/input"
import {useToast} from "../hooks/use-toast";
import {Toaster} from "../components/ui/toaster";

function LendCategory() {
    const navigate = useNavigate()
    const [categoryItemsCount, setCategoryItemsCount] = useState<number>(1)
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [inventoryItem, setInventoryItem] = useState<InventoryItemProps>()
    const {id} = useParams()
    const {keycloak, token} = useKeycloak()
    const [userInfo, setUserInfo] = useState<KeyCloakUserInfo>()
    const [isStartPopoverOpen, setStartPopoverOpen] = useState(false)
    const [isEndPopoverOpen, setEndPopoverOpen] = useState(false)
    const { toast } = useToast()

    const fetchItem = React.useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_II_SERVICE_HOST}/categories/${id}`);
            if (response.ok) {
                const data = await response.json()
                setInventoryItem(data)

                // Hier toast wenn categoryitemscount = 0


                // Hier muss noch nach dem richtigen Status abgefragt werden und nach nicht lend gefilert
                setCategoryItemsCount(data.items.filter((item: any) => item.status === '').length)

                if (categoryItemsCount == 0) {
                    alert("Dieser Gegenstand ist nicht mehr verfügbar")
                    navigate(`/`)
                }
            }
        } catch (e) {
            console.log(e);
        }
    }, [id]);

    const FormSchema = z.object({
        startDate: z.date({
            required_error: "Startdatum erforderlich",
        }),
        endDate: z.date({
            required_error: "Enddatum erforderlich",
        }),
        quantity: z.number({}).min(1, 'Anzahl muss größer als Null sein').max(categoryItemsCount, `Es sind maximal ${categoryItemsCount} Exemplare verfügbar`)
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });
    useEffect(() => {
        void fetchItem()
        keycloak?.loadUserInfo().then(val => setUserInfo(val as any), (e) => console.log(e))
        if (form.getValues("startDate")) {
            const newStartDate = new Date(form.getValues("startDate"));
            newStartDate.setDate(newStartDate.getDate() + 1);
            setStartDate(newStartDate);
        }
    }, [fetchItem, keycloak, form.getValues("startDate")]);

    type FormschemaType = z.infer<typeof FormSchema>;

    async function fetchItemIds(quantity: number) {
        // Hier wird ein array an item_ids zurückgegeben anhand quantity.

        return []
    }

    const onSubmit = async (values: FormschemaType) => {
        const formattedStartDate = format(values.startDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");
        const formattedEndDate = format(values.endDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");
        const quantity = form.getValues("quantity")
        const itemIdArray = await fetchItemIds(quantity)
        const jsonArray: Array<{ startDate: string; endDate: string; itemId: number; userId: string | undefined }> = [];

        // Hier das Array befüllen
        itemIdArray.forEach((itemId) => {
            jsonArray.push({
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                itemId: itemId,
                userId: userInfo?.sub
            })
        })

        try {
            // die URL muss noch angepasst werden
            const response = await fetch(`${process.env.REACT_APP_SPIFF}/api/v1.0/messages/Reservation-request-start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(jsonArray),
            });

            if (response.ok) {
                toast({
                    title: "Reservierung erfolgreich",
                    description: `Du hast ${form.getValues("quantity")} ${inventoryItem?.name ?? "diesen Gegenstand"} erfolgreich reserviert.`,
                })
            } else {
                switch (response.status) {
                    case 400:
                        setErrorMessage(`${inventoryItem?.name} ist zu diesem Zeitraum nicht verfügbar.`);
                        break;
                    case 401:
                        setErrorMessage("Du hast nicht die benötigten Rechte um diesen Gegenstand auszuleihen.");
                        break;
                    case 403:
                        setErrorMessage("Zugriff verweigert.");
                        break;
                    case 404:
                        setErrorMessage("Ressource nicht gefunden. Kontaktieren Sie den Administrator");
                        break;
                    case 500:
                        setErrorMessage("Serverfehler: Ein Problem auf dem Server ist aufgetreten. Bitte versuchen Sie es später erneut.");
                        break;
                    default:
                        setErrorMessage("Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.");
                        break;
                }
            }
        } catch (error) {
            setErrorMessage("Beim senden der Ausleihanfrage ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es später erneut.")
            console.error('Error message set:', errorMessage);
        }
    };

    return (
        <div className="max-w-[600px] mx-auto">
            <Toaster />
            {errorMessage && (
                <div id="alert" role="alert" className="mt-4">
                    <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                        Fehlermeldung
                    </div>
                    <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                        <p>{errorMessage}</p>
                    </div>
                </div>
            )}
            <div className="p-4">
                <CardHeader className="flex items-center text-customBlue">
                    <CardTitle className="mb-4">Ausleihformular</CardTitle>
                </CardHeader>
                <div className="max-w-[600px] mx-auto">
                    <Card>
                        <CardContent className="mt-4">
                            <h3 className="text-center mb-4">{inventoryItem?.name}</h3>
                            <div className="flex justify-center mb-4">
                                {!!inventoryItem?.photoUrl &&
                                    <img src={inventoryItem.photoUrl} alt={inventoryItem.description}
                                         className='h-80 w-full object-cover'/>}
                            </div>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({field}) => (
                                            <FormItem className="flex flex-col">
                                                <div className="flex flex-col sm:justify-center ml-8 mr-8">
                                                    <FormDescription className="mt-4 mb-4">
                                                        Bitte geben Sie die Anzahl, ein Ausleih- und Abgabedatum ein.
                                                    </FormDescription>
                                                    <label className="text-sm pb-2 mt-4">Ausleihdatum</label>
                                                    <Popover open={isStartPopoverOpen} onOpenChange={setStartPopoverOpen}>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button data-testid="startDateButton" role="button"
                                                                        variant={"outline"}
                                                                        className={cn("w-[210px] pl-3 text-left font-normal",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                        onClick={() => {
                                                                            setStartPopoverOpen(true)
                                                                            form.reset({
                                                                                startDate: form.getValues("startDate"),
                                                                                quantity: form.getValues("quantity")
                                                                            })
                                                                        }}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "dd. MMM yyyy")
                                                                    ) : (
                                                                        <span>Startdatum auswählen</span>
                                                                    )}
                                                                    <CalendarIcon
                                                                        className="ml-auto h-4 w-4 opacity-50"/>
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                data-testid="CalenderStartButton"
                                                                selected={field.value}
                                                                onSelect={(date) => {
                                                                    field.onChange(date)
                                                                    setStartPopoverOpen(false)
                                                                }}
                                                                disabled={(date) => date < new Date()}
                                                                defaultMonth={
                                                                    field.value
                                                                        ? field.value
                                                                        : (() => {
                                                                            const tomorrow = new Date()
                                                                            tomorrow.setDate(tomorrow.getDate() + 1)
                                                                            return tomorrow
                                                                        })()
                                                                }
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage/>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({field}) => (
                                            <FormItem className="flex flex-col">
                                                <div className="flex flex-col sm:justify-center ml-8 mr-8">
                                                    <label className="text-sm pb-2">Abgabedatum</label>
                                                    <Popover open={isEndPopoverOpen} onOpenChange={setEndPopoverOpen}>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button data-testid="endDateButton" variant={"outline"}
                                                                        className={cn("w-[210px] pl-3 text-left font-normal",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                        onClick={() => setEndPopoverOpen(true)}
                                                                        disabled={!field.value && !startDate}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "dd. MMM yyyy")
                                                                    ) : (
                                                                        <span>Enddatum auswählen</span>
                                                                    )}
                                                                    <CalendarIcon
                                                                        className="ml-auto h-4 w-4 opacity-50"/>
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={(date) => {
                                                                    field.onChange(date)
                                                                    setEndPopoverOpen(false)
                                                                }}
                                                                disabled={(date) =>
                                                                    startDate ? date < startDate : true
                                                                }
                                                                defaultMonth={
                                                                    startDate
                                                                        ? startDate
                                                                        : (() => {
                                                                            const tomorrow = new Date()
                                                                            tomorrow.setDate(tomorrow.getDate() + 1)
                                                                            return tomorrow
                                                                        })()
                                                                }
                                                                initialFocus
                                                                className="relative color-black custom-calendar"
                                                                classNames={{
                                                                    day_selected: "color-customOrange text-black"
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage/>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({field}) => (
                                            <FormItem className="flex flex-col">
                                                <div className="flex flex-col sm:justify-center ml-8 mr-8">
                                                    <label className="text-sm pb-2">Anzahl</label>
                                                    <FormControl className="text-left font-sans w-[80px] pl-3">
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            defaultValue={1}
                                                            max={categoryItemsCount ?? 1}
                                                            min={1}
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-between items-center mt-4">
                                        <Button onClick={() => navigate(`/category/${id}`)}
                                                className="flex bg-customBlue text-customBeige hover:bg-customRed hover:text-customBeige ml-8">
                                            &larr; Detailseite
                                        </Button>
                                        <Button type="submit"
                                                disabled={
                                                    undefined == form.getValues("startDate") ||
                                                    undefined == form.getValues("endDate") ||
                                                    0 == form.getValues("quantity") ||
                                                    0 == categoryItemsCount ||
                                                    categoryItemsCount < form.getValues("quantity")
                                                }
                                                className="text-customBeige bg-customBlue mr-8 hover:bg-customRed hover:text-customBeige">
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
    );
}

export default LendCategory;