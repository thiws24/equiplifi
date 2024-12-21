# Equipli Frontend

## Requirements
Node.js >= v20 (all developers have v20)
https://nodejs.org/en/download/prebuilt-installer
We suggest to use a package-manager like nvm if possible. 
For MacOS users the installation is easier. Windows users will need to install Chocolatey
https://nodejs.org/en/download/package-manager

After installation check node and npm versions with following commands:
```
node -v

npm -v
```


## Setup
In the frontend folder create a .env file. There you should set following variables:
```
NODE_ENV=development
VITE_INVENTORY_SERVICE_HOST='https://inventory.equipli.de'
VITE_KEYCLOAK='https://id.equipli.de'
VITE_RESERVATION_HOST='https://reservation.equipli.de'
VITE_QR_HOST='https://qr.equipli.de'
VITE_SPIFF='https://spiff.equipli.de'
```

You can also use a service that is locally running, e.g. localhost:8080

Install dependencies:
 `npm install`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `dist` folder.\


## Project structure

The project is using **Typescript**, so reusable interfaces should be defined in the src/interfaces folder.

Avoid creating unnecessary .css files. Use **Tailwind** classes instead: https://tailwindcss.com/docs/utility-first

Routing for new pages is defined in App.tsx.

Pages are in the src/pages folder.

Shadcn components https://ui.shadcn.com/docs are under *src/components/ui*. Everything else under src/components folder are custom components written by us. 
