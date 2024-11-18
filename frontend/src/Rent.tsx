import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.min.css";

const Rent = () => {
    const navigate = useNavigate();

    const initialValues = {
        startDate: "",
        endDate: "",
    };

    const validationSchema = Yup.object({
        startDate: Yup.date().required("Startdatum erforderlich"),
        endDate: Yup.date().required("Enddatum erforderlich"),
    });

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
            <CardHeader className="flex items-center">
                <CardTitle> Ausleihformular </CardTitle>
            </CardHeader>
            <div>
                <CardContent>
                    <div>
                        <br/>
                        <div className="max-w-[600px] mx-auto">
                            <Card>
                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                >
                                    {({ values, setFieldValue }) => (
                                        <Form>
                                            <br />
                                            <h3 className="flex justify-center">Name des Gegenstands</h3>
                                            <br />
                                            <div className="flex justify-center">BILD</div>
                                                <div className="flex flex-col sm:flex-row sm:justify-evenly mt-4 ml-8 mr-8">
                                                    <div className="left-element flex flex-col sm:flex-row sm:items-center sm:justify-center">
                                                        <label
                                                            htmlFor="startDate"
                                                            className="mb-1 sm:mb-0 sm:mr-2 text-sm font-semibold"
                                                        >
                                                            Ausleihdatum
                                                        </label>
                                                        <input
                                                            type="date"
                                                            id="startDate"
                                                            value={values.startDate || ""}
                                                            onChange={(e) => setFieldValue("startDate", e.target.value)}
                                                            className="border border-black p-1"
                                                        />
                                                    </div>
                                                    <div className="right-element flex flex-col sm:flex-row sm:items-center sm:justify-center mt-4 sm:mt-0">
                                                        <label
                                                            htmlFor="endDate"
                                                            className="mb-1 sm:mb-0 sm:mr-2 text-sm font-semibold"
                                                        >
                                                            Abgabedatum
                                                        </label>
                                                        <input
                                                            type="date"
                                                            id="endDate"
                                                            value={values.endDate || ""}
                                                            onChange={(e) => setFieldValue("endDate", e.target.value)}
                                                            className="border border-black p-1"
                                                        />
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
                                    )}
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
