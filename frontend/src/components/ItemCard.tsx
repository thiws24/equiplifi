import * as React from 'react';
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export const ItemCard: React.FC<InventoryItemProps> = ({ id, name, description, icon, photo, urn }) => {
  return (
    <a href={`/inventory-item/${id}`} target="_self">
      <Card className='h-full bg-white text-customBlack'>
        <CardHeader className='text-customBeige'>
          <CardTitle className='item-card-title text-customBlack'>{name}</CardTitle>
          <CardDescription className='item-card-description'>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <img src={`data:image/jpeg;base64,${photo}`} alt={name} className='w-full'/>
        </CardContent>
      </Card>
    </a>
  );
};