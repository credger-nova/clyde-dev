import * as React from "react"
import PartsReqCard, { SkeletonCard } from "../components/supply-chain/PartsReqCard"
import Grid from '@mui/material/Unstable_Grid2'
import Box from '@mui/material/Box'
import EditDialog from "../components/supply-chain/EditDialog"
import { PartsReq, PartsReqQuery } from "../types/partsReq"
import SearchFilter from "../components/supply-chain/SearchFilter"
import Collapse from '@mui/material/Collapse'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

import { usePartsReqs } from "../hooks/partsReq"


export default function SupplyChain() {
    const [activePartsReq, setActivePartsReq] = React.useState<PartsReq | null>(null)
    const [partsReqQuery, setPartsReqQuery] = React.useState<PartsReqQuery>({})
    const [open, setOpen] = React.useState<boolean>(false)

    const { data: partsReqs, isFetching: partsReqsFetching } = usePartsReqs(partsReqQuery)

    const handleOpenChange = () => {
        setOpen((prevState) => !prevState)
    }

    return (
        <div className="page-container">
            <Box sx={{ width: "100%", maxHeight: "100%", margin: "0px 15px", padding: "0px 10px" }}>
                <Box sx={{ marginBottom: "20px" }}>
                    <Collapse
                        in={open}
                    >
                        <SearchFilter
                            partsReqQuery={partsReqQuery}
                            setPartsReqQuery={setPartsReqQuery}
                        />
                    </Collapse>
                    <div className="collapse-button" onClick={handleOpenChange}>
                        Search and Filter
                        {open ?
                            <ExpandLessIcon
                                sx={{ height: "20px" }}
                            /> :
                            <ExpandMoreIcon
                                sx={{ height: "20px" }}
                            />
                        }
                    </div>
                </Box>
                <Box>
                    <Grid
                        container
                        direction="row"
                        justifyContent="flex-start"
                        sx={{ width: "100%" }}
                    >
                        {partsReqsFetching ? Array(10).fill(0).map((_, index) => {
                            return (
                                <Grid
                                    key={index}
                                >
                                    <SkeletonCard />
                                </Grid>
                            )
                        }) : partsReqs?.map((partsReq) => {
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