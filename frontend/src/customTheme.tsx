import { themeQuartz } from "@ag-grid-community/theming";

// to use myTheme in an application, pass it to the theme grid option
export const customTheme = themeQuartz
    .withParams({
        accentColor: "#F27428",
        backgroundColor: "#F2E9D7",
        browserColorScheme: "light",
        fontFamily: "inherit",
        headerFontSize: 14,
        headerFontWeight: 600,
        foregroundColor: "#0E0E0E",
        headerBackgroundColor: "#5588C7",
        borderColor: "#F2E9D7",
        oddRowBackgroundColor: "#5689C72E"
    });
