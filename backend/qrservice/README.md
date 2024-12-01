# QRService API

Ermöglicht das Generieren eines QR-Codes und liefert diesen entweder als PDF- oder PNG Datei zurück.

---

### QR-Code generieren

Baut selbständig eine URN bestehend aus der übergebenen ID.
Generiert dann einen QR-Code aus dieser URN, erstellt ein Label mit QR-Code und Name des Items und stellt dieses Label als PDF-Datei bzw. PNG-Datei bereit.

### Endpunkt

**URL:**  
`https://qr.equipli.de/qr`

### Benötigt folgende Query-Parameter

| Key    | Typ      | Beschreibung       | Beispielwert     |
|--------|----------|--------------------|------------------|
| `name` | `string` | Der Name des Items | `Volleyball`    |
| `id`   | `int`    | Eindeutige Item-ID | `17`            |

### Benötigt folgende Header-Parameter

Bestimmung des Outputformats (PNG oder PDF)

| Key             | Value            |
|-----------------|------------------|
| `Output-Format` | `PNG` oder `PDF` |

Beispiel für die Erzeugung eines Volleyball-Labels mit der ID 17:
```http
https://qr.equipli.de/qr?name=Volleyball&id=17
```


#### Response

    Status 200 (OK): Label mit dem generierten QR-Code wird als binärer Datenstrom (application/octet-stream) und dem gewüschten Output-Format zurückgegeben.
    Status 500 (Internal Server Error): Fehler bei der Generierung des QR-Codes oder PDF-Dokuments.
