workspace "Name" "Description" {

    !identifiers hierarchical

    model {
        u = person "User"
        pda = softwareSystem "PDA" {
            fe = container "Frontend" {
                tags "frontend"
                authComponent = component "Authentication Component" {
                    tags "authComponent"
                }
                uiComponent = component "UI Component" {
                    tags "uiComponent"
                }
            }
            pe = container "Process Engine" {
                tags "processEngine"
                bpmn = component "BPMN" {
                    tags "BPMN"
                }
            }
            qrLabelCodeService = container "qrLabelCodeService" {
                tags "qrLabelCode"
                endpoint_QR = component "Enpoint (Rest)" {
                    tags "endpoint_QR"
                }
                generator = component "QR-Code Generator" {
                    tags "generator"
                }
            }
            inventoryItemService = container "inventoryItemService" {
                tags "inventoryItem"
                modelLayer = component "Model Layer" {
                    tags "modelLayer"
                }
                repositoryService = component "Repository (Service Layer)" {
                    tags "repositoryService"
                }
                endpoint = component "Endpoint (REST)" {
                    tags "endpoint"
                }
            }

        }

        u -> pda.fe "Uses"
        pda.fe -> pda.pe "interacts with"

        pda.pe -> pda.qrLabelCodeService "invokes"
        pda.pe -> pda.inventoryItemService "invokes"
    }



    views {
        systemContext pda "Overview" {
            include *
            autolayout lr
        }

        container pda "Services" {
            include *
            autolayout lr
        }

        component pda.fe "Components-of-Frontend" {
            include *
            autolayout lr
        }

        component pda.qrLabelCodeService "Components-of-qrLabelCodeService" {
            include *
            autolayout lr
        }

        component pda.inventoryItemService "Components-of-inventoryItemService" {
            include *
            autolayout lr
        }

        component pda.pe "Components-of-processEngine" {
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