import * as React from 'react';
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export const ItemCard: React.FC<InventoryItemProps> = ({ id, name, description, icon, photo, urn }) => {
  return (
    <a href={`/inventory-item/${id}`} target="_blank" rel="noopener noreferrer">
      <Card className='h-full'>
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <img src={photo} alt={name} className='w-full'/>
        </CardContent>
      </Card>
    </a>
  );
};