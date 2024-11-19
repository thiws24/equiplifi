# Mail Service 📧 API Documentation

## Endpoints

### 1. Send Collection Mail

**Endpoint:** `/sendCollectionMail`

**Method:** `POST`

**Request Body:**

```json
{
  "receiverMail": "example@gmail.com",
  "name": "Hans",
  "item": "Volleyball",
  "collectionDate": "24.12.2024",
  "returnDate": "25.01.2025",
  "pickupLocation": "Hinter Vereinsheim in einer dunklen Ecke"
}
```

### 2. Send Return Mail

**Endpoint:** `/sendReturnMail`

**Method:** `POST`

**Request Body:**

```json
{
  "receiverMail": "example@gmail.com",
  "name": "Hans",
  "item": "Volleyball",
  "returnDate": "24.01.2024",
  "returnLocation": "Hinter Vereinsheim in einer dunklen Ecke"
}
```

# Quarkus specific Docs

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

You can then execute your native executable with: `./target/mailservice-1.0.0-SNAPSHOT-runner`

If you want to learn more about building native executables, please consult <https://quarkus.io/guides/maven-tooling>.


