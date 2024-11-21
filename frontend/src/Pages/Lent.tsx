import React, { useState, useEffect } from "react"
import {InventoryItemProps} from "../interfaces/InventoryItemProps";
import {useParams} from "react-router-dom";
import {LentView } from "./LentView";

function Lent() {
    const [inventoryItem, setInventoryItem] = useState<InventoryItemProps>();
    const { id } = useParams();

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
    }, [fetchItem]);

    return (
        <div>
            {inventoryItem && <LentView {...inventoryItem} />}
        </div>
    )
}

export default Lent;
