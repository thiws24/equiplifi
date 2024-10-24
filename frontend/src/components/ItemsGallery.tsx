import * as React from 'react';
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import { ItemCard } from "./ItemCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from "./ui/pagination";

interface Props {
  items: InventoryItemProps[]
}

export const ItemsGallery: React.FC<Props> = ({ items }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(items.length/10)

  function handlePageChange(newPage: number) {
    setCurrentPage(newPage);
  }

  return (
    <div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5'>
        {items.map(item => (<ItemCard {...item} key={item.id}/>))}
      </div>
      <Pagination className='mx-auto mt-5'>
        <PaginationContent>
          {currentPage !== 1 && (
            <PaginationItem onClick={() => handlePageChange(currentPage - 1)}>
              <PaginationPrevious href="#"/>
            </PaginationItem>
          )}
          {currentPage} von {totalPages}
          {currentPage < totalPages && (
            <PaginationItem onClick={() => handlePageChange(currentPage + 1)}>
              <PaginationNext href="#"/>
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};