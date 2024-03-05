import * as React from "react"
import { useAuth0 } from "@auth0/auth0-react"
import PartsReqCard, { SkeletonCard } from "../components/supply-chain/PartsReqCard"
import Grid from '@mui/material/Unstable_Grid2'
import Box from '@mui/material/Box'
import EditDialog from "../components/supply-chain/EditDialog"
import { PartsReq, PartsReqQuery } from "../types/partsReq"
import SearchFilter from "../components/supply-chain/SearchFilter"
import Collapse from '@mui/material/Collapse'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup, { toggleButtonGroupClasses } from '@mui/material/ToggleButtonGroup'
import AppsIcon from '@mui/icons-material/Apps'
import TableRowsIcon from '@mui/icons-material/TableRows'
import { styled } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'

import { usePartsReqs } from "../hooks/partsReq"
import { useNovaUser } from "../hooks/user"
import PartsReqTable from "../components/supply-chain/PartsReqTable"

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    [`& .${toggleButtonGroupClasses.grouped}`]: {
        margin: theme.spacing(0.5),
        border: 0,
        borderRadius: theme.shape.borderRadius,
        [`&.${toggleButtonGroupClasses.disabled}`]: {
            border: 0,
        },
    },
    [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]:
    {
        marginLeft: -1,
        borderLeft: '1px solid transparent',
    },
}));


export default function SupplyChain() {
    const { user } = useAuth0()
    const { data: novaUser, isFetched } = useNovaUser(undefined, user?.email)

    const [activePartsReq, setActivePartsReq] = React.useState<PartsReq | null>(null)
    const [partsReqQuery, setPartsReqQuery] = React.useState<PartsReqQuery>({ title: isFetched ? novaUser!.title : "" })
    const [open, setOpen] = React.useState<boolean>(false)
    const [uiType, setUIType] = React.useState<"card" | "table">(window.screen.width <= 600 ? "card" : "table")
    const [disabled, setDisabled] = React.useState<boolean>(window.screen.width <= 600)

    const { data: partsReqs, isFetching: partsReqsFetching } = usePartsReqs(partsReqQuery)

    React.useEffect(() => {
        if (window.screen.width <= 600) {
            setDisabled(true)
            setUIType("card")
        } else {
            setDisabled(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window.screen.width])

    const handleOpenChange = () => {
        setOpen((prevState) => !prevState)
    }

    const handleUIChange = (_event: React.MouseEvent<HTMLElement>, value: "table" | "card" | null) => {
        if (value) {
            setUIType(value)
        }
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
                    <div
                        style={{ display: "flex", justifyContent: "space-between" }}
                    >
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
                        <Box
                            sx={{
                                backgroundColor: "background.paper", borderBottomRightRadius: "0.5rem", borderBottomLeftRadius: "0.5rem"
                            }}
                        >
                            <StyledToggleButtonGroup
                                value={uiType}
                                exclusive
                                onChange={handleUIChange}
                            >
                                <Tooltip
                                    title="Cards"
                                    arrow
                                >
                                    <ToggleButton
                                        value="card"
                                    >
                                        <AppsIcon />
                                    </ToggleButton>
                                </Tooltip>
                                <Tooltip
                                    title="Table"
                                    arrow
                                >
                                    <ToggleButton
                                        value="table"
                                        disabled={disabled}
                                    >
                                        <TableRowsIcon />
                                    </ToggleButton>
                                </Tooltip>
                            </StyledToggleButtonGroup>
                        </Box>
                    </div>
                </Box>
                <Box>
                    {uiType === "card" ?
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
                        </Grid> :
                        <PartsReqTable
                            partsReqs={partsReqs}
                            fetching={partsReqsFetching}
                            setActivePartsReq={setActivePartsReq}
                        />
                    }

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