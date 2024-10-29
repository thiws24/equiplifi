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

            mailService = container "Mail Service" {
                tags "mailService"
                camelSMTP = component "Camel SMTP" {
                    tags "camelSMTP"
                }
                camelRest = component "Camel REST" {
                    tags "camelRest"
                }
            }

        }

        u -> pda.fe "Uses"
        pda.fe -> pda.pe "interacts with"

        pda.pe -> pda.qrLabelCodeService "invokes"
        pda.pe -> pda.inventoryItemService "invokes"
        pda.pe -> pda.mailService "invokes"
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

        component pda.mailService "Components-of-mailService" {
            include *
            autolayout lr
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
                background #43B794
                # background #135801
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