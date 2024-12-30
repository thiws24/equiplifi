import * as React from "react"
import { ItemDetailsProps } from "../interfaces/ItemDetailsProps"
import { ItemCard } from "./ItemCard"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious
} from "./ui/pagination"

interface Props {
    items: ItemDetailsProps[]
}

const itemsPerPage = 10

export const ItemsGallery: React.FC<Props> = ({ items }) => {
    const [currentPage, setCurrentPage] = React.useState(1)
    const totalPages = Math.ceil(items.length / itemsPerPage) || 1

    function handlePageChange(newPage: number) {
        setCurrentPage(newPage)
    }

    return (
        <div id="items-gallery" className="font-sans text-customBlack p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {items
                    .slice(
                        itemsPerPage * (currentPage - 1),
                        itemsPerPage * currentPage
                    )
                    .map((item) => (
                        <ItemCard {...item} key={item.id} />
                    ))}
            </div>
            <Pagination className="mx-auto mt-5">
                <PaginationContent>
                    {currentPage !== 1 && (
                        <PaginationItem
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <PaginationPrevious href="#" />
                        </PaginationItem>
                    )}
                    {currentPage} von {totalPages}
                    {currentPage < totalPages && (
                        <PaginationItem
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={"rounded-lg p-0"}
                        >
                            <PaginationNext href="#" />
                        </PaginationItem>
                    )}
                </PaginationContent>
            </Pagination>
        </div>
    )
}
