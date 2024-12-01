import {Calendar, ChevronUp, Home, Inbox, Search, Settings, User2} from "lucide-react"
import {
    SidebarContent, SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel, SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem, SidebarProvider, useSidebar,
} from "./ui/sidebar"
import {Sidebar} from "./ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "./ui/dropdown-menu";
import React from "react";

// Menu items.
const itemsLagerwart = [
    {
        title: "Item erstellen",
        url: "#",
        icon: Inbox,
    }
]
const itemsAllgemein = [
    {
        title: "Home",
        url: "http://localhost:3000",
        icon: Home,
    }
]

export function AppSidebar() {
    const { state } = useSidebar();
    return (
        (
            <SidebarProvider>
                <Sidebar collapsible='icon'>
                    <SidebarHeader><img src="/equipli-logo.svg"
                                        className="w-12 h-auto"
                                        alt="equipli logo"/></SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className='text-xl text-customBlue'>Allgemein</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {itemsAllgemein.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild
                                                               className="bg-customBeige text-customOrange hover:bg-customRed hover:text-customBeige">
                                                <a href={item.url} className="flex items-center gap-2">
                                                    {item.icon && <item.icon/>}
                                                    <span>{item.title}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                            <SidebarGroupLabel className='text-xl text-customBlue'>Lagerwart</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {itemsLagerwart.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild
                                                               className="bg-customBeige text-customOrange hover:bg-customRed hover:text-customBeige">
                                                <a href={item.url} className="flex items-center gap-2">
                                                    {item.icon && <item.icon/>}
                                                    <span>{item.title}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    {/* Footer der Sidebar */}
                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 text-customBlack">
                                            {state === "collapsed" ? (
                                                // Nur Icon anzeigen, wenn Sidebar collapsed ist
                                                <User2 className="h-6 w-6"/>
                                            ) : (
                                                // Icon und Text anzeigen, wenn Sidebar expanded ist
                                                <>
                                                    <User2/> Abmelden
                                                    <ChevronUp className="ml-auto"/>
                                                </>
                                            )}
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        side="top"
                                        className="bg-white shadow-lg rounded-md text-customBlack"
                                    >
                                        <DropdownMenuItem>
                                            <span>Abmelden</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>
            </SidebarProvider>
        ));
}