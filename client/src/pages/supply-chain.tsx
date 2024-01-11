import * as React from "react"
import PartsReqCard from "../components/supply-chain/PartsReqCard"
import { usePartsReqs } from "../hooks/partsReq"
import Grid from '@mui/material/Unstable_Grid2'
import Box from '@mui/material/Box'
import { PartsReq } from "../types/partsReq"


export default function SupplyChain() {
    const { data } = usePartsReqs()

    const [activePartsReq, setActivePartsReq] = React.useState<PartsReq | null>(null)

    return (
        <div className="page-container">
            <Box sx={{ width: "100%", maxHeight: "100%", margin: "15px", padding: "10px" }}>
                <Grid
                    container
                    direction="row"
                    justifyContent="flex-start"
                    sx={{ width: "100%" }}
                >
                    {data?.map((partsReq) => {
                        return (
                            <Grid
                                key={partsReq.id}
                            >
                                <PartsReqCard
                                    partsReq={partsReq}
                                    setActivePartsReq={setActivePartsReq}
                                />
                            </Grid>
                        )
                    })}
                </Grid>
            </Box>
        </div>
    )
}