import { useLocation } from 'react-router-dom';
import L2 from './L2';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Manager(){
    const location = useLocation()
    const {manager, managersEmployees, partsReqs} = location.state
    const navigate = useNavigate()
    console.log('location', location.state)
    console.log({manager, managersEmployees, partsReqs})

    return(
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            flexWrap: "wrap",
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
            <Box sx={{display: "flex", flexWrap: "wrap", gap: "24px"}}>
                <L2 novaUser={manager} managersEmployees={managersEmployees} partsReqs={partsReqs}/>
            </Box>
            
        </Box>
    )
}