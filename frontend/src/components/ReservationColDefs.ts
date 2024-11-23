import {ColDef} from "ag-grid-community";
import {ReservationItemProps} from "../interfaces/ReservationItemProps";

export const rColDefs: ColDef<ReservationItemProps>[] = [
    {
        headerName: "Start Datum", field: "startDate", sortable: true, filter: "agSetColumnFilter", flex: 1
    },
    {
        headerName: "End Datum", field: "endDate", sortable: true, filter: "agSetColumnFilter", flex: 1
    }
];