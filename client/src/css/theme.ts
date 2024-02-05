import { createTheme, Theme } from "@mui/material/styles";

export const PRIMARY_MAIN = "#FFFFFF";
export const PRIMARY_LIGHT = "#FCBB93";
export const PRIMARY_DARK = "#334787";
export const SECONDARY_MAIN = "#680bce";
export const SECONDARY_LIGHT = "#680bce";
export const SECONDARY_DARK = "#1A1E22";
export const BACKGROUND = "#1C252F";
export const PAPER = "#16181A";
export const ERROR_MAIN = "#EB5959";
export const ERROR_DARK = "#EB5959";

const theme: Theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: PRIMARY_MAIN,
            light: PRIMARY_LIGHT,
            dark: PRIMARY_DARK,
            contrastText: "#fff",
        },
        secondary: {
            main: SECONDARY_MAIN,
            light: SECONDARY_LIGHT,
            dark: SECONDARY_DARK,
            contrastText: "#fff",
        },
        background: {
            paper: PAPER,
            default: BACKGROUND,
        },
        error: {
            main: ERROR_MAIN,
            dark: ERROR_DARK,
        },
    },
    typography: {
        fontFamily: [
            "Lato",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(","),
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: "none",
            fontWeight: "400"
        }
    },

});

export default theme;
