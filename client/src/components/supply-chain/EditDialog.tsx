import * as React from "react"

import theme from "../../css/theme"

import { NovaUser } from "../../types/novaUser"

import { useParams, useNavigate } from "react-router-dom"
import { usePartsReq, useGeneratePDF } from "../../hooks/partsReq"

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import EditPartsReqForm from "../forms/EditPartsReqForm"
import Button from '@mui/material/Button'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import CircularProgress from '@mui/material/CircularProgress'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import MoneyOffIcon from '@mui/icons-material/MoneyOff'

interface Props {
    novaUser: NovaUser | undefined,
    isFetched: boolean
}

export default function EditDialog(props: Props) {
    const { novaUser, isFetched } = props

    const { mutateAsync: generatePDF } = useGeneratePDF()
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: partsReq } = usePartsReq(Number(id))

    const [edit, setEdit] = React.useState<boolean>(false)
    const [save, setSave] = React.useState<boolean>(false)
    const [saveDisabled, setSaveDisabled] = React.useState<boolean>(true)
    const [reset, setReset] = React.useState<boolean>(false)
    const [pdfLoading, setPDFLoading] = React.useState<boolean>(false)
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
    const pdfMenuOpen = Boolean(anchorEl)

    const handleSave = () => {
        setSave(true)

        setEdit(false)
    }

    const handleClose = () => {
        setEdit(false)

        navigate("../")
    }

    const handleCancel = () => {
        setEdit(false)

        setReset(true)
    }

    const handlePdfClick = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget)
    }

    const handlePdfMenuClose = () => {
        setAnchorEl(null)
    }

    const handleGeneratePDF = async (id: number, pricing: boolean) => {
        setPDFLoading(true)

        generatePDF({ id, pricing }).then(() => {
            setPDFLoading(false)
            setAnchorEl(null)
        })
    }

    return (partsReq && (
        <Dialog
            open={!!id}
            onClose={handleClose}
            sx={{
                "& .MuiDialog-paper": {
                    minWidth: "95vw"
                }
            }}
        >
            <DialogTitle sx={{ textAlign: "center", padding: "5px" }}>
                Parts Requisition #{partsReq.id}
            </DialogTitle>
            <DialogContent sx={{ padding: "0px" }}>
                <EditPartsReqForm
                    partsReq={partsReq}
                    save={save}
                    setSave={setSave}
                    setSaveDisabled={setSaveDisabled}
                    edit={edit}
                    reset={reset}
                    setReset={setReset}
                />
            </DialogContent>
            {!edit &&
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={handleClose}
                        startIcon={<CloseIcon />}
                        sx={{
                            backgroundColor: theme.palette.error.dark,
                            "&.MuiButton-root:hover": {
                                backgroundColor: theme.palette.error.dark
                            }
                        }}
                    >
                        Close
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handlePdfClick}
                        startIcon={pdfLoading ?
                            <CircularProgress
                                size={20}
                            /> :
                            <PictureAsPdfIcon />
                        }
                        sx={{
                            backgroundColor: theme.palette.primary.dark,
                            "&.MuiButton-root:hover": {
                                backgroundColor: theme.palette.primary.dark
                            }
                        }}
                    >
                        {pdfLoading ? "Exporting" : "Export PDF"}
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={pdfMenuOpen}
                        onClose={handlePdfMenuClose}
                        anchorOrigin={{ vertical: "top", horizontal: "left" }}
                        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
                    >
                        <MenuItem
                            onClick={() => handleGeneratePDF(partsReq.id, true)}
                            disableRipple
                        >
                            <AttachMoneyIcon />
                            With Pricing
                        </MenuItem>
                        <MenuItem
                            onClick={() => handleGeneratePDF(partsReq.id, false)}
                            disableRipple
                        >
                            <MoneyOffIcon />
                            Without Pricing
                        </MenuItem>
                    </Menu>
                    <Button
                        variant="contained"
                        onClick={() => setEdit(!edit)}
                        startIcon={<EditIcon />}
                        disabled={partsReq.status === "Closed - Parts in Hand" || partsReq.status === "Rejected - Closed" ||
                            (isFetched && novaUser?.jobTitle.includes("Lead") && partsReq.requester.id !== novaUser.id)
                        }
                        sx={{
                            backgroundColor: theme.palette.primary.dark,
                            "&.MuiButton-root:hover": {
                                backgroundColor: theme.palette.primary.dark
                            }
                        }}
                    >
                        Edit
                    </Button>
                </DialogActions>
            }
            {edit &&
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={handleCancel}
                        startIcon={<CloseIcon />}
                        sx={{
                            backgroundColor: theme.palette.error.dark,
                            "&.MuiButton-root:hover": {
                                backgroundColor: theme.palette.error.dark
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saveDisabled}
                        startIcon={<SaveIcon />}
                        sx={{
                            backgroundColor: theme.palette.primary.dark,
                            "&.MuiButton-root:hover": {
                                backgroundColor: theme.palette.primary.dark
                            }
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            }
        </Dialog>
    ))
}