import * as React from "react"

import { TITLES } from "../utils/titles"

import { NovaUser } from "../types/kpa/novaUser"

import { useAuth0 } from "@auth0/auth0-react"
import { useAuth0Token } from "../hooks/utils"
import { usePartsReqs } from "../hooks/partsReq"
import { useNovaUser } from "../hooks/kpa/user"
import { useLocation } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

import PartsReqCard, { SkeletonCard } from "../components/supply-chain/PartsReqCard"
import Grid from "@mui/material/Unstable_Grid2"
import Box from "@mui/material/Box"
import EditDialog from "../components/supply-chain/EditDialog"
import { PartsReqQuery } from "../types/partsReq"
import SearchFilter from "../components/supply-chain/SearchFilter"
import Collapse from "@mui/material/Collapse"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup, { toggleButtonGroupClasses } from "@mui/material/ToggleButtonGroup"
import AppsIcon from "@mui/icons-material/Apps"
import TableRowsIcon from "@mui/icons-material/TableRows"
import { styled } from "@mui/material/styles"
import Tooltip from "@mui/material/Tooltip"
import TablePagination from "@mui/material/TablePagination"
import PartsReqTable from "../components/supply-chain/PartsReqTable"
import { Routes, Route } from "react-router-dom"
import Button from "@mui/material/Button"
import theme from "../css/theme"
import RefreshIcon from "@mui/icons-material/Refresh"

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    [`& .${toggleButtonGroupClasses.grouped}`]: {
        margin: theme.spacing(0.5),
        border: 0,
        borderRadius: theme.shape.borderRadius,
        [`&.${toggleButtonGroupClasses.disabled}`]: {
            border: 0,
        },
    },
    [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]: {
        marginLeft: -1,
        borderLeft: "1px solid transparent",
    },
}))

const OPS_VP_TITLES = TITLES.find((item) => item.group === "Ops Vice President")?.titles ?? []

export default function SupplyChain() {
    const { user } = useAuth0()
    const token = useAuth0Token()
    const { data: novaUser, isFetched } = useNovaUser(token, user?.email)
    const { state } = useLocation()
    const queryClient = useQueryClient()
    const { statuses, requesters, region, urgency } = state ?? {}

    const [open, setOpen] = React.useState<boolean>(false)
    const [uiType, setUIType] = React.useState<"card" | "table">(window.screen.width <= 600 ? "card" : "table")
    const [disabled, setDisabled] = React.useState<boolean>(window.screen.width <= 600)
    const [page, setPage] = React.useState<number>(0)
    const [itemsPerPage, setItemsPerPage] = React.useState<number>(20)
    const [vpApproval, setVpApproval] = React.useState<boolean>((novaUser && OPS_VP_TITLES.includes(novaUser.jobTitle)) ?? false)
    const [scAll, setScAll] = React.useState<boolean>(false)
    const [partsReqQuery, setPartsReqQuery] = React.useState<PartsReqQuery>({
        user: isFetched ? novaUser : null,
        status: statuses ?? [],
        requester: requesters ? requesters.map((user: NovaUser) => user.id) : [],
        region: region ? [region.toUpperCase()] : [],
        urgency: urgency ? [urgency] : [],
        vpApproval: vpApproval,
        scAll: scAll,
    })

    const { data: partsReqs, isFetching: partsReqsFetching } = usePartsReqs(token, partsReqQuery)

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

    const handlePageChange = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeItemsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setItemsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handleRefreshPartsReqs = () => {
        queryClient.refetchQueries({ queryKey: ["partsReq"] })
    }

    return (
        <div className="page-container" style={{ flexDirection: "column" }}>
            <Box sx={{ marginBottom: "20px" }}>
                <Collapse in={open} sx={{ margin: "0px 20px" }}>
                    <SearchFilter
                        partsReqQuery={partsReqQuery}
                        setPartsReqQuery={setPartsReqQuery}
                        initialStatuses={statuses}
                        initialRequesters={requesters}
                        initialRegion={region}
                        initialUrgency={urgency}
                        novaUser={novaUser}
                        vpApproval={vpApproval}
                        setVpApproval={setVpApproval}
                        scAll={scAll}
                        setScAll={setScAll}
                    />
                </Collapse>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "0px 20px" }}>
                    <div className="collapse-button" onClick={handleOpenChange}>
                        Search and Filter
                        {open ? <ExpandLessIcon sx={{ height: "20px" }} /> : <ExpandMoreIcon sx={{ height: "20px" }} />}
                    </div>
                    <Button
                        onClick={handleRefreshPartsReqs}
                        startIcon={<RefreshIcon />}
                        sx={{
                            backgroundColor: theme.palette.primary.dark,
                            marginBottom: "10px",
                            "&.MuiButton-root:hover": {
                                backgroundColor: theme.palette.primary.dark,
                            },
                            margin: "5px",
                        }}
                    >
                        Refresh
                    </Button>
                    <Box
                        sx={{
                            backgroundColor: "background.paper",
                            borderBottomRightRadius: "0.5rem",
                            borderBottomLeftRadius: "0.5rem",
                        }}
                    >
                        <StyledToggleButtonGroup value={uiType} exclusive onChange={handleUIChange}>
                            <Tooltip
                                title="Cards"
                                enterDelay={1000}
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            border: "1px solid white",
                                            bgcolor: "background.paper",
                                        },
                                    },
                                }}
                            >
                                <ToggleButton value="card">
                                    <AppsIcon />
                                </ToggleButton>
                            </Tooltip>
                            <Tooltip
                                title="Table"
                                enterDelay={1000}
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            border: "1px solid white",
                                            bgcolor: "background.paper",
                                        },
                                    },
                                }}
                            >
                                <ToggleButton value="table" disabled={disabled}>
                                    <TableRowsIcon />
                                </ToggleButton>
                            </Tooltip>
                        </StyledToggleButtonGroup>
                    </Box>
                </div>
            </Box>
            <Box sx={{ height: "calc(100% - 74px - 52px)", margin: "0px 20px" }}>
                {uiType === "card" ? (
                    <Grid container direction="row" justifyContent="flex-start" sx={{ width: "100%" }}>
                        {partsReqsFetching
                            ? Array(20)
                                  .fill(0)
                                  .map((_, index) => {
                                      return (
                                          <Grid key={index}>
                                              <SkeletonCard />
                                          </Grid>
                                      )
                                  })
                            : partsReqs?.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage).map((partsReq) => {
                                  return (
                                      <Grid key={partsReq.id}>
                                          <PartsReqCard partsReq={partsReq} />
                                      </Grid>
                                  )
                              })}
                    </Grid>
                ) : (
                    <PartsReqTable
                        partsReqs={partsReqs?.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage)}
                        fetching={partsReqsFetching}
                    />
                )}
                <Routes>
                    <Route path="/:id" element={<EditDialog novaUser={novaUser} isFetched={isFetched} />}></Route>
                </Routes>
                <TablePagination
                    count={partsReqs ? partsReqs.length : 0}
                    page={page}
                    onPageChange={handlePageChange}
                    rowsPerPage={itemsPerPage}
                    onRowsPerPageChange={handleChangeItemsPerPage}
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    showFirstButton
                    showLastButton
                    component="div"
                />
            </Box>
        </div>
    )
}
