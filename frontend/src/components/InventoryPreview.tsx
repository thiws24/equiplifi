import React, { useRef, useState, useEffect } from "react"
import { ItemDetailsProps } from "../interfaces/ItemDetailsProps"
import { useNavigate } from "react-router-dom"
import { InventoryPreviewCard } from "./InventoryPreviewCard"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

interface Props {
    items: ItemDetailsProps[]
}

export const InventoryPreview: React.FC<Props> = ({ items }) => {
    const navigate = useNavigate()
    const itemsToShow = items.slice(0, 10) // Display more items
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [showLeftButton, setShowLeftButton] = useState(false)
    const [showRightButton, setShowRightButton] = useState(true)

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -260,
                behavior: "smooth"
            })
        }
    }

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 260,
                behavior: "smooth"
            })
        }
    }

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } =
                scrollContainerRef.current
            setShowLeftButton(scrollLeft > 0)
            setShowRightButton(scrollLeft + clientWidth < scrollWidth)
        }
    }

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.addEventListener("scroll", handleScroll)
        }
        return () => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.removeEventListener(
                    "scroll",
                    handleScroll
                )
            }
        }
    }, [])

    return (
        <Card className="bg-white border-none my-10 drop-shadow-2xl">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Inventar durchsuchen</CardTitle>

                    <button
                        className="bg-white hover:bg-white text-customOrange hover:text-orange-600 py-2 px-4 rounded inline-flex items-center text-sm"
                        onClick={() => navigate("/inventory")}
                    >
                        <span className="">Alle anzeigen</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                <div
                    id="items-gallery"
                    className="font-sans text-customBlack relative"
                >
                    {showLeftButton && (
                        <button
                            className="absolute left-[-10px] top-1/2 transform -translate-y-1/2 bg-customOrange text-white text-sm p-2 rounded-full hover:bg-orange-600 z-[100]"
                            onClick={scrollLeft}
                        >
                            <ChevronLeft />
                        </button>
                    )}
                    <div
                        className="flex overflow-x-auto space-x-4 no-scrollbar p-4"
                        ref={scrollContainerRef}
                        style={{ scrollBehavior: "smooth" }}
                    >
                        {itemsToShow.map((item) => (
                            <InventoryPreviewCard {...item} key={item.id} />
                        ))}
                        <div className="flex items-center justify-center">
                            <button
                                className="text-customOrange text-sm px-4 py-2 rounded hover:text-orange-600 flex items-center"
                                onClick={() => navigate("/inventory")}
                            >
                                Alle anzeigen
                                <ArrowRight className="h-8 ml-2" />
                            </button>
                        </div>
                    </div>
                    {showRightButton && (
                        <button
                            className="absolute right-[-10px] top-1/2 transform -translate-y-1/2 bg-customOrange text-white text-sm p-2 rounded-full hover:bg-orange-600 z-[100]"
                            onClick={scrollRight}
                        >
                            <ChevronRight />
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default InventoryPreview
