workspace "Name" "Description" {

    !identifiers hierarchical

    model {
        u = person "User"
        pda = softwareSystem "PDA" {
            fe = container "Frontend" {
                tags "frontend"
            }
            pe = container "Process Engine" {
                tags "process engine"
            }
            qr-Label-Code-Service = container "QR-Label-Code Service" {
                tags "qr-label-code"
            }
            inventoryItem-Service = container "InventoryItem Service" {
                tags "inventory-item"
            }

        }

        u -> pda.fe "Uses"
        pda.fe -> pda.pe "interacts with"

        pda.pe -> pda.qr-Label-Code-Service "invokes"
        pda.pe -> pda.inventoryItem-Service "invokes"
    }



    views {
        systemContext pda "Diagram1" {
            include *
            autolayout lr
        }

        container pda "Diagram2" {
            include *
            autolayout lr
        }

        styles {
            element "Element" {
                color #ffffff
            }
            element "Person123" {
                background #05527d
                shape person
            }
            element "Software System" {
                background #066296
            }
            element "Container" {
                background #0773af
            }
                element "Database" {
                shape cylinder
            }
        }
    }

    configuration {
        scope softwaresystem
    }

}