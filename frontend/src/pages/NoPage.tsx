import React from "react"

function NoPage() {

    return (
        <div className="text-center">
            <div className="flex justify-center w-full font-semibold text-3xl text-customBlue mt-10">
                Diese Seite existiert nicht
            </div>
            <div className="flex justify-center w-full text-xl text-customBlue mt-4">
                Über die Sidebar können Sie zur Startseite oder Ihren Reservierungen navigieren.
            </div>
        </div>
    )
}

export default NoPage