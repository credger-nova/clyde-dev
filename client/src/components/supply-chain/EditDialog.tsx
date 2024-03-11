import * as React from "react"

import { PartsReq } from "../../types/partsReq"

import theme from "../../css/theme"

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import EditPartsReqForm from "../forms/EditPartsReqForm"
import Button from '@mui/material/Button'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'

interface Props {
    partsReq: PartsReq,
    open: boolean,
    setActivePartsReq: React.Dispatch<React.SetStateAction<PartsReq | null>>
}

export default function EditDialog(props: Props) {
    const { partsReq, open, setActivePartsReq } = props

    const [edit, setEdit] = React.useState<boolean>(false)
    const [save, setSave] = React.useState<boolean>(false)
    const [saveDisabled, setSaveDisabled] = React.useState<boolean>(true)

    const handleSave = () => {
        setSave(true)

        setEdit(false)
    }

    const handleClose = () => {
        setActivePartsReq(null)
        setEdit(false)
    }

    return (partsReq && (
        <Dialog
            open={open}
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
                    setActivePartsReq={setActivePartsReq}
                    save={save}
                    setSave={setSave}
                    setSaveDisabled={setSaveDisabled}
                    edit={edit}
                />
            </DialogContent>

            {!edit &&
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={() => setEdit(!edit)}
                        startIcon={<EditIcon />}
                        sx={{ backgroundColor: theme.palette.primary.dark }}
                    >
                        Edit
                    </Button>
                </DialogActions>
            }
            {edit &&
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={handleClose}
                        startIcon={<CloseIcon />}
                        sx={{ backgroundColor: theme.palette.error.dark, "&.MuiButton-root:hover": { backgroundColor: theme.palette.error.dark } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saveDisabled}
                        startIcon={<SaveIcon />}
                        sx={{ backgroundColor: theme.palette.primary.dark }}
                    >
                        Save
                    </Button>
                </DialogActions>
            }
        </Dialog>
    ))
}