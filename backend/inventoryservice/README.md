# InventoryService API

Ermöglicht das Erstellen, Abrufen, Aktualisieren und Löschen von InventoryItems.

---

## REST API Dokumentation

### Category

#### GET /categories

Gibt alle Kategorien und die dazugehörigen Items zurück.

**Response:**

- Status: `200 OK`
    ```json
    [
      {
        "id": 1,
        "name": "Volleyball",
        "icon": "🏐",
        "description": "Volleyball-Set bestehend aus Netz, Bällen und Pumpe",
        "items": [
          {
            "id": 1,
            "status": "OK",
            "location": "THI Sportplatz"
          },
          ...
        ]
        
      },
      ...
    ]
    ```

#### GET /categories/{id}

Gibt die Kategorie mit der ID {id} und die dazugehörigen Items zurück.

**Response:**

- Status: `200 OK`
    ```json
    {
      "id": 1,
      "name": "Volleyball",
      "icon": "🏐",
      "description": "Volleyball-Set bestehend aus Netz, Bällen und Pumpe",
      "items": [
        {
          "id": 1,
          "status": "OK",
          "location": "THI Sportplatz"
        },
        ...
      ]
    }
    ```

- Status: `404 Not Found`: Kategorie nicht gefunden.

#### POST /categories

Erstellt eine neue Kategorie.

**Request Body:**

```json
{
  "name": "Volleyball",
  "icon": "🏐",
  "description": "Volleyball-Set bestehend aus Netz, Bällen und Pumpe",
  "itemCount": 3,
  "itemLocation": "THI Sportplatz"
}
```

**Response:**

- Status: `201 Created`
    ```json
    {
      "id": 1,
      "name": "Volleyball",
      "icon": "🏐",
      "description": "Volleyball-Set bestehend aus Netz, Bällen und Pumpe",
      "items": [
        {
          "id": 1,
          "status": "OK",
          "location": "THI Sportplatz"
        },
        ...
      ]
    }
    ```
- Status: `400 Bad Request`: Name leer oder bereits vorhanden.

#### PUT /categories/{id}

Aktualisiert die Kategorie mit der ID {id}.

**Request Body:**

```json
{
  "name": "Volleyball",
  "icon": "🏐",
  "description": "Volleyball-Set bestehend aus Netz, Bällen und Pumpe"
}
```

**Response:**

- Status: `200 OK`
    ```json
    {
      "id": 1,
      "name": "Volleyball",
      "icon": "??",
      "description": "Volleyball-Set bestehend aus Netz, Bällen und Pumpe",
      "items": [
        {
          "id": 1,
          "status": "OK",
          "location": "THI Sportplatz"
        },
        ...
      ]
    }
    ```
- Status: `404 Not Found`: Kategorie nicht gefunden.
- Status: `400 Bad Request`: Name leer oder bereits vorhanden.

#### DELETE /categories/{id}

Löscht die Kategorie mit der ID {id} und alle dazugehörigen Items.

**Response:**

- Status: `204 No Content`: Kategorie gelöscht.
- Status: `404 Not Found`: Kategorie nicht gefunden.

#### GET /categories/{categoryId}/image

Gibt das Bild der Kategorie mit der ID {categoryId} zurück.

**Response:**

- Status: `200 OK`
    - Content-Type: `image/jpeg`
    - Body: Bild-Datei
- Status: `404 Not Found`: Kategorie nicht gefunden.

#### POST /categories/{categoryId}/image

Lädt ein Bild für die Kategorie mit der ID {categoryId} hoch.

**Request Body:**

- Multipart-Form-Data: `image`
- fileContent: Bild-Datei
- contentType: `image/jpeg` oder `image/png`

**Response:**

- Status: `201 Created`: Bild erfolgreich hochgeladen.
- Status: `404 Not Found`: Kategorie nicht gefunden.

## InventoryItem

#### GET /categories/{categoryId}/items

Gibt alle Items der Kategorie mit der ID {categoryId} zurück.

**Response:**

- Status: `200 OK`
    ```json
    [
      {
        "id": 1,
        "status": "OK",
        "location": "THI Sportplatz"
      },
      ...
    ]
    ```
- Status: `404 Not Found`: Kategorie nicht gefunden.

#### GET /categories/{categoryId}/items/{itemId}

Gibt das Item mit der ID {itemId} der Kategorie mit der ID {categoryId} zurück.

**Response:**

- Status: `200 OK`
    ```json
    {
      "id": 1,
      "status": "OK",
      "location": "THI Sportplatz"
    }
    ```
- Status: `404 Not Found`: Kategorie oder Item nicht gefunden.

#### POST /categories/{categoryId}/items

Erstellt ein neues Item in der Kategorie mit der ID {categoryId}.

**Request Body:**

```json
{
  "status": "OK",
  "location": "THI Sportplatz"
}
```

**Response:**

- Status: `201 Created`
    ```json
    {
      "id": 1,
      "status": "OK",
      "location": "THI Sportplatz"
    }
    ```

- Status `404 Not Found`: Kategorie nicht gefunden.

#### PUT /categories/{categoryId}/items/{itemId}

Aktualisiert das Item mit der ID {itemId} der Kategorie mit der ID {categoryId}.

**Request Body:**

```json
{
  "status": "OK",
  "location": "THI Sportplatz"
}
```

**Response:**

- Status: `200 OK`
    ```json
    {
      "id": 1,
      "status": "OK",
      "location": "THI Sportplatz"
    }
    ```
- Status: `404 Not Found`: Kategorie oder Item nicht gefunden.

#### DELETE /categories/{categoryId}/items/{itemId}

Löscht das Item mit der ID {itemId} der Kategorie mit der ID {categoryId}.

**Response:**

- Status: `204 No Content`: Item gelöscht.
- Status: `404 Not Found`: Kategorie oder Item nicht gefunden.

#### GET /items/{itemId}

Gibt das Item mit der ID {itemId} inklusive aller Attribute seiner Kategorie zurück.

**Response:**

- Status: `200 OK`
    ```json
    {
      "id": 1,
      "categoryId": 1,
      "name": "Volleyball",
      "description": "Volleyball-Set bestehend aus Netz, Bällen und Pumpe",
      "icon": "🏐",
      "status": "OK",
      "location": "THI Sportplatz"
    }
    ```
- Status: `404 Not Found`: Item nicht gefunden.

---

### Verfügbare Item-Status

- `OK`: Item ist verfügbar.
- `LENT`: Item ist verliehen.
- `BROKEN`: Item ist defekt.
- `IN_MAINTENANCE`: Item wird gewartet.
- `MAINTENANCE_REQUIRED`: Wartung erforderlich.
- `LOST`: Item ist verloren.

---

# Deployment

## Umgebungsvariablen

Die folgenden Umgebungsvariablen müssen gesetzt werden, um den InventoryService zu starten:

| Variable                        | Beschreibung                                                                       |
|:--------------------------------|:-----------------------------------------------------------------------------------|
| QUARKUS_DATASOURCE_JDBC_URL     | JDBC-URL der Datenbank                                                             |    
| QUARKUS_DATASOURCE_USERNAME     | Benutzername für die Datenbank                                                     |      
| QUARKUS_DATASOURCE_PASSWORD     | Passwort für die Datenbank                                                         |
| QUARKUS_HTTP_CORS_ORIGINS       | Erlaubte CORS-Origins (z.B. `https://app.equipli.de` oder `http://localhost:3000`) |
| QUARKUS_OIDC_AUTH_SERVER_URL    | URL des Keycloak-Servers                                                           |
| QUARKUS_OIDC_CLIENT_ID          | Client-ID für den Keycloak-Client                                                  |
| QUARKUS_OIDC_CREDENTIALS_SECRET | Secret für den Keycloak-Client                                                     |
| QUARKUS_MINIO_URL               | URL des MinIO-Servers                                                              |
| QUARKUS_MINIO_PORT              | Port des MinIO-Servers                                                             |
| QUARKUS_MINIO_ACCESS_KEY        | Access Key für den MinIO-Client                                                    |
| QUARKUS_MINIO_SECRET_KEY        | Secret Key für den MinIO-Client                                                    |
| QUARKUS_MINIO_BUCKET_NAME       | Name des MinIO-Buckets (z.B. inventory-images)                                     |
| QUARKUS_MINIO_SECURE            | `true` für HTTPS, `false` für HTTP                                                 |

# Quarkus Getting Started

This project uses Quarkus, the Supersonic Subatomic Java Framework.

If you want to learn more about Quarkus, please visit its website: <https://quarkus.io/>.

## Running the application in dev mode

You can run your application in dev mode that enables live coding using:

```shell script
./mvnw compile quarkus:dev
```

> **_NOTE:_**  Quarkus now ships with a Dev UI, which is available in dev mode only at <http://localhost:8080/q/dev/>.

## Packaging and running the application

The application can be packaged using:

```shell script
./mvnw package
```

It produces the `quarkus-run.jar` file in the `target/quarkus-app/` directory.
Be aware that it’s not an _über-jar_ as the dependencies are copied into the `target/quarkus-app/lib/` directory.

The application is now runnable using `java -jar target/quarkus-app/quarkus-run.jar`.

If you want to build an _über-jar_, execute the following command:

```shell script
./mvnw package -Dquarkus.package.jar.type=uber-jar
```

The application, packaged as an _über-jar_, is now runnable using `java -jar target/*-runner.jar`.

## Creating a native executable

You can create a native executable using:

```shell script
./mvnw package -Dnative
```

Or, if you don't have GraalVM installed, you can run the native executable build in a container using:

```shell script
./mvnw package -Dnative -Dquarkus.native.container-build=true
```

You can then execute your native executable with: `./target/iiservice-1.0.0-SNAPSHOT-runner`

If you want to learn more about building native executables, please consult <https://quarkus.io/guides/maven-tooling>.

## Related Guides

- REST ([guide](https://quarkus.io/guides/rest)): A Jakarta REST implementation utilizing build time processing and
  Vert.x. This extension is not compatible with the quarkus-resteasy extension, or any of the extensions that depend on
  it.
- REST Jackson ([guide](https://quarkus.io/guides/rest#json-serialisation)): Jackson serialization support for Quarkus
  REST. This extension is not compatible with the quarkus-resteasy extension, or any of the extensions that depend on it
- Hibernate ORM with Panache ([guide](https://quarkus.io/guides/hibernate-orm-panache)): Simplify your persistence code
  for Hibernate ORM via the active record or the repository pattern
- JDBC Driver - PostgreSQL ([guide](https://quarkus.io/guides/datasource)): Connect to the PostgreSQL database via JDBC

## Provided Code

### Hibernate ORM

Create your first JPA entity

[Related guide section...](https://quarkus.io/guides/hibernate-orm)

[Related Hibernate with Panache section...](https://quarkus.io/guides/hibernate-orm-panache)

### REST

Easily start your REST Web Services

[Related guide section...](https://quarkus.io/guides/getting-started-reactive#reactive-jax-rs-resources)
