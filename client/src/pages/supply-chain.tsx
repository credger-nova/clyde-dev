import * as React from "react"
import PartsReqCard from "../components/supply-chain/PartsReqCard"
import { usePartsReqs } from "../hooks/partsReq"
import Grid from '@mui/material/Unstable_Grid2'
import Box from '@mui/material/Box'
import EditDialog from "../components/supply-chain/EditDialog"
import { PartsReq } from "../types/partsReq"
import SearchFilter from "../components/supply-chain/SearchFilter"


export default function SupplyChain() {
    const [activePartsReq, setActivePartsReq] = React.useState<PartsReq | null>(null)
    const [searchString, setSearchString] = React.useState<string>("")

    const { data: partsReqs } = usePartsReqs(searchString)

    return (
        <div className="page-container">
            <Box sx={{ width: "100%", maxHeight: "100%", margin: "0px 15px", padding: "0px 10px" }}>
                <Box sx={{ marginBottom: "20px" }}>
                    <SearchFilter
                        searchString={searchString}
                        setSearchString={setSearchString}
                    />
                </Box>
                <Box>
                    <Grid
                        container
                        direction="row"
                        justifyContent="flex-start"
                        sx={{ width: "100%" }}
                    >
                        {partsReqs?.map((partsReq) => {
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
                <EditDialog
                    partsReq={activePartsReq!}
                    open={activePartsReq !== null}
                    setActivePartsReq={setActivePartsReq}
                />
            </Box>
        </div>
    )
}