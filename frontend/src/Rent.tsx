import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.min.css";
import { DatePicker } from "./components/DatePicker";


const Rent = () => {
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        startDate: Yup.date().required("Startdatum erforderlich"),
        endDate: Yup.date().required("Enddatum erforderlich")
    });

    const initialValues = {
        startDate: "",
        endDate: "",
    };

    type ValuesSchema = typeof initialValues;

    const handleSubmit = async (values: ValuesSchema) => {
        try {
            const response = await axios.post(
                "https://spiff.equipli.de/api/v1.0/messages/Reservation-request",
                {
                    ...values,
                    // inventoryItemId: id,
                    // userId: userId
                }
            );
            console.log("Ausleihprozess gestartet:", response.data);
            alert("Reservierung erfolgreich!");
        } catch (error) {
            console.error("Fehler beim Starten des Ausleihprozesses:", error);
            alert("Fehler bei der Reservierung! Bitte versuchen Sie es erneut.");
        }
    };

    return (
        <div>
            <br />
            <CardHeader className="flex items-center text-customBlue">
                <CardTitle>Ausleihformular</CardTitle>
            </CardHeader>
            <div>
                <CardContent>
                    <div>
                        <br />
                        <div className="max-w-[600px] mx-auto">
                            <Card>
                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                >
                                    <Form>
                                        <br />
                                        <h3 className="flex justify-center">Name des Gegenstands</h3>
                                        <br />
                                        <div className="flex justify-center">BILD</div>
                                        <div className="flex flex-col sm:justify-center mt-4 ml-8 mr-8 border-gray-300 p-4 rounded-lg border-2">
                                            <div className="flex flex-col items-center mb-4">
                                                <label htmlFor="startDate" className="mb-1 text-sm font-semibold">
                                                    Ausleihdatum
                                                </label>
                                                <DatePicker/>
                                                {/*<DatePicker*/}
                                                {/*    value={values.startDate}*/}
                                                {/*    onChange={(date: Date) => setFieldValue("startDate", date)}*/}
                                                {/*/>*/}
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <label htmlFor="endDate" className="mb-1 text-sm font-semibold">
                                                    Abgabedatum
                                                </label>
                                                <DatePicker/>

                                                {/*<DatePicker*/}
                                                {/*    value={values.endDate}*/}
                                                {/*    onChange={(date: Date) => setFieldValue("endDate", date)}*/}
                                                {/*/>*/}
                                            </div>
                                        </div>
                                        <div className="flex justify-evenly mt-4">
                                            <Button
                                                onClick={() => navigate("/")}
                                                className="bg-customBlue text-customBeige hover:bg-customRed hover:text-customBeige mr-auto ml-8 flex"
                                            >
                                                &larr; Zurück
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="bg-customBlue text-customBeige hover:bg-customRed hover:text-customBeige ml-auto mr-8 flex"
                                            >
                                                &#10003; Absenden
                                            </Button>
                                        </div>
                                    </Form>
                                </Formik>
                                <br />
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </div>
        </div>
    );
};

export default Rent;
