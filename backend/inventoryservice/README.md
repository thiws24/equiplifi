# InventoryService API

Ermöglicht das Erstellen, Abrufen, Aktualisieren und Löschen von InventoryItems.

---

### Hinzufügen eines InventoryItems

Fügt ein neues InventoryItem hinzu.

```http
POST /inventoryitems/{id}
```

#### Request Body

```json
{
  "name": "Volleyball",
  "photoUrl": "https://example.com/photo.jpg",
  "icon": "🏐",
  "urn": "example-urn"
}
```

#### Response

    Status 201 (Created): Das InventoryItem wurde erfolgreich erstellt.
    Status 400 (Bad Request): Der Name des InventoryItems darf nicht leer sein.

```json
{
  "id": 1,
  "name": "Volleyball",
  "photoUrl": "https://example.com/photo.jpg",
  "icon": "🏐",
  "urn": "example-urn"
}
```

---

### Alle InventoryItems abrufen

```http
GET /inventoryitems
```

#### Response

    Status 200 (OK)

```json
[
  {
    "id": 1,
    "name": "Volleyball",
    "photoUrl": "https://example.com/photo.jpg",
    "icon": "🏐",
    "urn": "example-urn"
  },
  {
    "id": 2,
    "name": "Basketball",
    "photoUrl": "https://example.com/photo.jpg",
    "icon": "🏀",
    "urn": "example-urn"
  }
]
```

---

### Einzelnes InventoryItem abrufen

Ruft ein spezifisches InventoryItem anhand seiner ID ab.

```http
GET /inventoryitems/{id}
```

#### Response

    Status 200 (OK)
    Status 404 (Not Found): InventoryItem nicht gefunden.

```json
{
  "id": 1,
  "name": "Volleyball",
  "photoUrl": "https://example.com/photo.jpg",
  "icon": "🏐",
  "urn": "example-urn"
}
```

---

### InventoryItem aktualisieren

Aktualisiert ein bestehendes InventoryItem anhand seiner ID.

```http
PUT /inventoryitems/{id}
```

#### Request Body

```json
{
  "name": "Fußball",
  "photoUrl": "https://example.com/newphoto.jpg",
  "icon": "⚽️",
  "urn": "new-urn"
}
```

#### Response

    Status 200 (OK): InventoryItem erfolgreich aktualisiert.
    Status 404 (Not Found): InventoryItem nicht gefunden.

```json
{
  "id": 1,
  "name": "Fußball",
  "photoUrl": "https://example.com/newphoto.jpg",
  "icon": "⚽️",
  "urn": "new-urn"
}
```

---

### InventoryItem löschen

Löscht ein spezifisches InventoryItem anhand seiner ID.

```http
DELETE /inventoryitems/{id}
```

#### Response

    Status 204 (No Content): InventoryItem erfolgreich gelöscht.
    Status 404 (Not Found): InventoryItem nicht gefunden.

---

# Deployment

## Umgebungsvariablen

Um den InventoryService mit einer Datenbank zu verbinden, müssen folgende Umgebungsvariablen gesetzt werden:

| Variable                     | Beschreibung                   |
|:-----------------------------|:-------------------------------|
| QUARKUS_DATASOURCE_JDBC_URL  | JDBC-URL der Datenbank         |    
| QUARKUS_DATASOURCE_USERNAME  | Benutzername für die Datenbank |      
| QUARKUS_DATASOURCE_PASSWORD  | Passwort für die Datenbank     |

---

# inventoryservice

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

- REST ([guide](https://quarkus.io/guides/rest)): A Jakarta REST implementation utilizing build time processing and Vert.x. This extension is not compatible with the quarkus-resteasy extension, or any of the extensions that depend on it.
- REST Jackson ([guide](https://quarkus.io/guides/rest#json-serialisation)): Jackson serialization support for Quarkus REST. This extension is not compatible with the quarkus-resteasy extension, or any of the extensions that depend on it
- Hibernate ORM with Panache ([guide](https://quarkus.io/guides/hibernate-orm-panache)): Simplify your persistence code for Hibernate ORM via the active record or the repository pattern
- JDBC Driver - PostgreSQL ([guide](https://quarkus.io/guides/datasource)): Connect to the PostgreSQL database via JDBC

## Provided Code

### Hibernate ORM

Create your first JPA entity

[Related guide section...](https://quarkus.io/guides/hibernate-orm)

[Related Hibernate with Panache section...](https://quarkus.io/guides/hibernate-orm-panache)


### REST

Easily start your REST Web Services

[Related guide section...](https://quarkus.io/guides/getting-started-reactive#reactive-jax-rs-resources)
