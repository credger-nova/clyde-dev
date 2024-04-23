import * as React from "react"

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import theme from "../css/theme"
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'

interface Props {
    setShowTestingSplashScreen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function TestingSplashPage(props: Props) {
    const { setShowTestingSplashScreen } = props

    const handleTestClick = () => {
        sessionStorage.setItem("showTestingSplash", "false")

        setShowTestingSplashScreen(false)
    }

    const handleProdClick = () => {
        sessionStorage.setItem("showTestingSplash", "true")

        window.location.href = "https://kepler.nova-compression.com/"
    }

    return (
        <div
            style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}
        >
            <img
                src="https://res.cloudinary.com/dvdturlak/image/upload/v1701810257/Kepler/nova-simple_yrdti4.svg"
                style={{ height: "5em" }}
            />
            <Divider sx={{ width: "50%" }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: "red" }}>
                ATTENTION!
            </Typography>
            <Typography variant="body2" sx={{ width: "50%", textAlign: "center", marginTop: "10px" }}>
                You are attempting to connect to the Kepler testing site. Please verify that you are correctly accessing the testing site or click the button below
                to be redirected to the main Kepler site.
            </Typography>
            <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "10px" }}>
                <Button
                    onClick={handleTestClick}
                    variant="outlined"
                    sx={{ marginRight: "5px" }}
                >
                    Continue to testing
                </Button>
                <Button
                    onClick={handleProdClick}
                    variant="contained"
                    endIcon={<ArrowRightAltIcon />}
                    sx={{
                        marginLeft: "5px",
                        backgroundColor: theme.palette.primary.dark,
                        "&.MuiButton-root:hover": {
                            backgroundColor: theme.palette.primary.dark
                        }
                    }}
                >
                    Take me to Kepler
                </Button>
            </div>
        </div>
    )
}