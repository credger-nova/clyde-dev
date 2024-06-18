import * as React from "react"
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import L2 from './L2';

export default function Manager(){
    const location = useLocation()
    const navigate = useNavigate()

    if(!location.state){
        return(
            <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginTop: "32px"}}>
                <Typography sx={{fontSize: "24px"}}>Error</Typography>
                <Button
                variant="outlined"
                sx={{width: "128px"}}
                onClick={()=> {
                    navigate('/')
                }}
                >
                    Go Back
                </Button>
            </Box>
        )
    }

    const {manager, managersEmployees, partsReqs} = location.state
    
    return(
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            alignItems: "center",
            background: "rgba(255,255,255,0.1)",
            padding: "24px"}}
        >
            <Typography variant="h2" sx={{fontSize: "24px", fontWeight: "400" }}>Parts Requsitions For {manager.firstName} {manager.lastName}'s Team</Typography>
            <Button
                variant="outlined"
                sx={{width: "128px"}}
                onClick={()=> {
                    navigate('/')
                }}
            >
                Go Back
            </Button>
            <L2 novaUser={manager} managersEmployees={managersEmployees} partsReqs={partsReqs}/>
        </Box>
    )
}