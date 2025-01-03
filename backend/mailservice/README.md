# Mail Service 📧 API Dokumentation

## Arten von E-Mails

Im Moment können folgende Arten von E-Mails versendet werden:

### 1. Reservierungsbestätigung
Queue: ```reservation-confirmation```

### 2. Stornierbestätigung
Queue: ```cancellation-confirmation```

### 3. Rückgabebestätigung
Queue: ```return-confirmation```

### 4. Erinnerung an Rückgabe
Queue: ```return-reminder```

### 5. Bestätigung des Lagerwartes
Queue: ```storekeeper-confirmation```

### 6. Bestätigung über erhalt der Anfrage
Queue: ```request-confirmation```

## Verwendung
Der Mail-Service wird von anderen Services verwendet, um E-Mails zu versenden. Dazu wird ein POST-Request an den ActiveMQ-Server gesendet.

### z.B für Reservierung bestätigen

#### HTTP Request
```
POST http://activemq:8161/api/message/reservation-confirmation?type=queue
Content-Type: application/json
Authorization: Basic YWRtaW46YWRtaW4xMjM=
```

#### Request Body
```
[
  {
    "itemId": "1",
    "startDate": "2024-11-28",
    "endDate": "2024-11-30",
    "userId": "705d4906-3bd6-4c21-84e1-15994b49730d",
    "reservationId": "123"
  },
  {
    "itemId": "2",
    "startDate": "2024-12-28",
    "endDate": "2024-12-30",
    "userId": "705d4906-3bd6-4c21-84e1-15994b49730d",
    "reservationId": "456"
  }
]
```

### Beachten:

Das Beispiel zeigt einen Request für die Bestätigung einer Reservierung. Die anderen E-Mail-Typen können analog versendet werden.
Dazu muss die Queue im Request, hier ``send-reservation-confirmation`` entsprechend angepasst werden.

Die möglichen Queues sind:
- reservation-confirmation
- cancellation-confirmation
- return-confirmation
- return-reminder
- storekeeper-confirmation
- request-confirmation