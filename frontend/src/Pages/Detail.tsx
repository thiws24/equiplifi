import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import { DetailView } from "./DetailView";

function Detail() {
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
            {inventoryItem && <DetailView {...inventoryItem} />}
        </div>
    );
}

export default Detail;
