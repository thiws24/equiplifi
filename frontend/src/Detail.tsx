import React from 'react';
import { useParams } from 'react-router-dom';
import { InventoryItemProps } from "./interfaces/InventoryItemProps";
import { DetailView } from "./components/DetailView";

function Detail() {
    const [inventoryItem, setInventoryItem] = React.useState<InventoryItemProps>()
    const { id } = useParams();

    async function fetchItem() {
        try {
            const response = await fetch(`${process.env.REACT_APP_II_SERVICE_HOST}/api/inventoryitems/${id}`)
            if (response.ok) {
                const data = await response.json();
                setInventoryItem(data);
            }
        } catch (e) {
            console.log(e)
        }
    }

    React.useEffect(() => {
        void fetchItem();
    }, [])
    return (
        <div>
            {inventoryItem && <DetailView {...inventoryItem}/>}
        </div>
    )
}

export default Detail;