import * as React from "react"

import theme from "../../css/theme"

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

export default function EditDialog() {
    const { mutateAsync: generatePDF } = useGeneratePDF()

    const { id } = useParams()
    const navigate = useNavigate()
    const { data: partsReq } = usePartsReq(Number(id))

    const [edit, setEdit] = React.useState<boolean>(false)
    const [save, setSave] = React.useState<boolean>(false)
    const [saveDisabled, setSaveDisabled] = React.useState<boolean>(true)
    const [reset, setReset] = React.useState<boolean>(false)
    const [pdfLoading, setPDFLoading] = React.useState<boolean>(false)

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

    const handleGeneratePDF = async (id: number) => {
        setPDFLoading(true)

        generatePDF(id).then(() => setPDFLoading(false))
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
                        onClick={() => handleGeneratePDF(partsReq.id)}
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
                    <Button
                        variant="contained"
                        onClick={() => setEdit(!edit)}
                        startIcon={<EditIcon />}
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