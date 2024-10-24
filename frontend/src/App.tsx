import React from 'react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef } from "ag-grid-community"
import { InventoryItemProps } from "./interfaces/InventoryItemProps";
import { TableGalleryView } from "./components/TableGalleryView";

function App() {
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItemProps[]>([])

  const colDefs: ColDef<InventoryItemProps, any>[] = [
    {field: "id", flex: 1, filter: 'agSetColumnFilter' },
    {field: "name", flex: 1, filter: 'agSetColumnFilter' },
    {field: "icon", flex: 1, filter: 'agSetColumnFilter' },
    {field: "photo", flex: 1},
    {field: "urn", flex: 1, filter: 'agSetColumnFilter' }
  ]

  const [loading, setLoading] = React.useState(true);
  const [totalCount, setTotalCount] = React.useState(0);

  async function fetchInventoryItems(page: number) {
    try {
      const response = await fetch(`${process.env.REACT_APP_II_SERVICE_HOST}/api/inventoryitems`, {
        method: "POST",
        body: JSON.stringify({
          page: page,
        })
      })
      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data);
      }
    } catch (e) {
      console.log(e)
    }

    setLoading(false);
  }

async function getTotalCount() {
  try {
    const response = await fetch(`${process.env.REACT_APP_II_SERVICE_HOST}/api/inventoryItems/count`, {
      method: "GET",
    })
    if (response.ok) {
      const total = await response.json();
      setTotalCount(total);
    }
  } catch (e) {
    console.log(e)
    setTotalCount(10);
  }
}

  React.useEffect(() => {
    void fetchInventoryItems(1);
    void getTotalCount();
  }, [])

  return (
    <div className="m-10">
      <main className="main">
        <TableGalleryView
          data={inventoryItems}
          colDefs={colDefs}
          loading={loading}
          totalPages={totalCount/10}
          onPageChange={fetchInventoryItems}
        />
      </main>
    </div>
  );

}

export default App;