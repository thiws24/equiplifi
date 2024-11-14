# QRService API

Ermöglicht das Generieren eines QR-Codes aus einer URN und liefert diesen als PDF-Datei zurück.

---

### QR-Code generieren

Generiert einen QR-Code aus einer gegebenen URN und stellt diesen als PDF-Datei bereit.

```http
POST /qr
```

#### Request Body

```json
{
  "urn": "example-urn"
}
```

#### Response

    Status 200 (OK): PDF-Datei mit dem generierten QR-Code wird als binärer Datenstrom (application/octet-stream) zurückgegeben.
    Status 500 (Internal Server Error): Fehler bei der Generierung des QR-Codes oder PDF-Dokuments.
