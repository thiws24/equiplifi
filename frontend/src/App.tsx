import React from 'react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef } from "ag-grid-community"
import { InventoryItemProps } from "./interfaces/InventoryItemProps";
import { TableGalleryView } from "./components/TableGalleryView";

function App() {
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItemProps[]>([])

  const colDefs: ColDef<InventoryItemProps, any>[] = [
    { field: "id", flex: 1, filter: 'agSetColumnFilter' },
    { field: "name", flex: 1, filter: 'agSetColumnFilter' },
    { field: "icon", flex: 1, filter: 'agSetColumnFilter' },
    { field: "photo", flex: 1 },
    { field: "urn", flex: 1, filter: 'agSetColumnFilter' }
  ]

  const [loading, setLoading] = React.useState(true);

  async function fetchInventoryItems() {
    try {
      const response = await fetch(`${process.env.REACT_APP_II_SERVICE_HOST}/api/inventoryitems`)
      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data);
      }
    } catch (e) {
      console.log(e)
    }

    setLoading(false);
  }


  React.useEffect(() => {
    void fetchInventoryItems();
  }, [])

  return (
    <div className="m-10">
      <main className="main">
        <TableGalleryView
          data={inventoryItems}
          colDefs={colDefs}
          loading={loading}
        />
      </main>
    </div>
  );

}

export default App;