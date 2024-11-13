workspace "Name" "Description" {

    !identifiers hierarchical

    model {
        u = person "User" "Will einen Gegenstand mieten"
        pda = softwareSystem "PDA" {
            fe = container "Frontend" ""{
                tags "frontend"
                uiComponent = component "UI Component" {
                    tags "uiComponent"
                    description "Tailwind + shadcn"
                }
                routingComponent = component "Routing Component" {
                    tags "routingComponent"
                    description "React Router"
                }
                restComponent = component "Endpoint" {
                    tags "uiComponent"
                    description "REST"
                }
            }
            pe = container "Process Engine" "Spiff Workflow" {
                tags "processEngine"
                bpmn = component "BPMN" {
                    tags "BPMN"
                }
            }
            qrLabelCodeService = container "qr-service" {
                tags "qrLabelCode"
                endpoint_QR = component "Endpoint" {
                    tags "endpoint_QR"
                    description "REST"
                }
                generator = component "QR-Code Generator" {
                    tags "generator"
                }
            }
            inventoryItemService = container "inventory-item-service" {
                tags "inventoryItem"
                modelLayer = component "Model Layer" {
                    tags "modelLayer"
                }
                repositoryService = component "Repository (Service Layer)" {
                    tags "repositoryService"
                }
                endpoint = component "Endpoint" {
                    tags "endpoint"
                    description "REST"
                }
            }
            mailService = container "mail-service" {
                tags "mailService"
                camelSMTP = component "Camel SMTP" {
                    tags "camelSMTP"
                }
                camelRest = component "Camel REST" {
                    tags "camelRest"
                }
            }
            keycloak = container "Keycloak" {
                tags "keycloak"
                keycloak = component "Keycloak" {
                    tags "keycloak"
                }
            }
            reservationService = container "reservation-service" {
                tags "reservationService"
                endpoint = component "Endpoint" {
                    tags "endpoint"
                    description "REST"
                }
                modelLayer = component "Model Layer" {
                    tags "modelLayer"
                }
                repositoryService = component "Repository (Service Layer)" {
                    tags "repositoryService"
                }
            }
        }

        u -> pda.fe "Uses"

        pda.fe -> pda.pe "sends request to"
        pda.fe -> pda.keycloak "validates session with"

        pda.pe -> pda.qrLabelCodeService "invokes"
        pda.pe -> pda.inventoryItemService "invokes"
        pda.pe -> pda.mailService "invokes"
        pda.pe -> pda.reservationService "invokes"
        pda.pe -> pda.keycloak "verifies token"

        pda.keycloak -> u "authenticates"
    }

    views {
        systemContext pda "Overview" {
            include *
            title "[System Context] Overview" 
            autolayout tb
        }

        container pda "Services" {
            include *
            title "[Container] Services" 
            description ""
            autolayout bt
        }

        component pda.fe "Components-of-Frontend" {
            include *
            title "[Component] Frontend" 
            description ""
            autoLayout tb
        }

        component pda.qrLabelCodeService "Components-of-qrLabelCodeService" {
            include *
            title "[Component] QR-Code Label Service" 
            description ""
            autolayout tb
        }

        component pda.inventoryItemService "Components-of-inventoryItemService" {
            include *
            title "[Component] Inventory Item Service" 
            description ""
            autolayout tb
        }

        component pda.pe "Components-of-processEngine" {
            include *
            title "[Component] Process Engine" 
            description ""
            autolayout tb
        }

        component pda.mailService "Components-of-mailService" {
            include *
            title "[Component] Mail Service" 
            description ""
            autolayout tb
        }

        component pda.reservationService "Components-of-reservationService" {
            include *
            title "[Component] Reservation Service" 
            description ""
            autolayout tb
        }

        component pda.keycloak "Components-of-keycloak" {
            include *
            title "[Component] Keycloak" 
            description ""
            autolayout tb
        }

        styles {
            element "Element" {
                color #FFFFFF
            }
            element "Software System" {
                background #184864
            }
            element "Container" {
                background #075E8D
            }
            element "Component" {
                background #0773af
            }
            element "Component" {
                background #1289C9
            }
            element "Person" {
                shape Person
                background #43B794
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