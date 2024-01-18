import * as React from "react"
import PartsReqCard from "../components/supply-chain/PartsReqCard"
import { usePartsReqs } from "../hooks/partsReq"
import Grid from '@mui/material/Unstable_Grid2'
import Box from '@mui/material/Box'
import EditDialog from "../components/supply-chain/EditDialog"


export default function SupplyChain() {
    const { data } = usePartsReqs()

    const [activePartsReqId, setActivePartsReqId] = React.useState<number | null>(null)

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
                                    setActivePartsReqId={setActivePartsReqId}
                                />
                            </Grid>
                        )
                    })}
                </Grid>
            </Box>
            <EditDialog
                partsReqId={activePartsReqId!}
                open={activePartsReqId !== null}
                setActivePartsReqId={setActivePartsReqId}
            />
        </div>
    )
}