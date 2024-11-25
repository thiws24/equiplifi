import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "../components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../components/ui/calendar";
import React, { useEffect, useState } from "react";
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useKeycloak } from "../keycloak/KeycloakProvider";
import { KeyCloakUserInfo } from "../interfaces/KeyCloakUserInfo";

function Lend()  {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [inventoryItem, setInventoryItem] = useState<InventoryItemProps>();
    const { id } = useParams();
    const { keycloak, token } = useKeycloak()
    const [userInfo, setUserInfo] = useState<KeyCloakUserInfo>()

    const fetchItem = React.useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_II_SERVICE_HOST}/inventoryitems/${id}`);
            if (response.ok) {
                const data = await response.json();
                setInventoryItem(data);
            }
        } catch (e) {
            console.log(e);
        }

    }, [id]);

    useEffect(() => {
        void fetchItem();
        keycloak?.loadUserInfo().then(val => setUserInfo(val as any), (e ) => console.log(e))
    }, [fetchItem, keycloak]);

    const FormSchema = z.object({
        startDate: z.date({
            required_error: "Startdatum erforderlich",
        }),
        endDate: z.date({
            required_error: "Enddatum erforderlich",
        }),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });

    type FormschemaType = z.infer<typeof FormSchema>;

    useEffect(() => {
        if (form.getValues("startDate")) {
            const newStartDate = new Date(form.getValues("startDate"));
            newStartDate.setDate(newStartDate.getDate() + 1);
            setStartDate(newStartDate);
        }
    }, [form.getValues("startDate")]);

    const onSubmit = async (values: FormschemaType) => {
        const formattedStartDate = format(values.startDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");
        const formattedEndDate = format(values.endDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");

        try {
            const response = await fetch(`${process.env.REACT_APP_SPIFF}/api/v1.0/messages/Reservation-request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                    inventoryItemId: Number(id),
                    userId: userInfo?.sub
                }),
            });

            if (response.ok) {
                window.open(`/inventory-item/${id}`, '_self')
            } else {
                setErrorMessage(`HTTP Fehler! Status: ${response.status}`);
            }
        } catch (error) {
            setErrorMessage("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.")
            console.error('Error message set:', errorMessage);
        }
    };

    return (
        <div className="max-w-[600px] mx-auto">
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
                                {!!inventoryItem?.photoUrl && <img src={inventoryItem.photoUrl} alt={inventoryItem.description}
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
                                                        Bitte geben Sie ein Ausleih- und Abgabedatum ein.
                                                    </FormDescription>
                                                    <label className="text-sm pb-2 mt-4">Ausleihdatum</label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button data-testid="startDateButton" role="button" variant={"outline"}
                                                                    className={cn("w-[210px] pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                    onClick={() => {
                                                                        form.reset({
                                                                            startDate: form.getValues("startDate"),
                                                                            endDate: undefined
                                                                        })
                                                                    }}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP")
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
                                                                    field.onChange(date);
                                                                }}
                                                                disabled={(date) => date < new Date()}
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
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button data-testid="endDateButton" variant={"outline"}
                                                                    className={cn("w-[210px] pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                    disabled={!field.value && !startDate}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP")
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
                                                                onSelect={field.onChange}
                                                                disabled={(date) =>
                                                                    startDate ? date < startDate : true
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
                                    <div className="flex justify-between items-center mt-4">
                                        <Button onClick={() => navigate(`/inventory-item/${id}`)} className="flex bg-customBlue text-customBeige hover:bg-customRed hover:text-customBeige ml-8">
                                            &larr; Detailseite
                                        </Button>
                                        <Button type="submit" className="text-customBeige bg-customBlue mr-8 hover:bg-customRed hover:text-customBeige">
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

export default Lend;