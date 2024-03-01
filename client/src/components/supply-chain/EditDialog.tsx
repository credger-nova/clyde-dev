import * as React from "react"
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import EditPartsReqForm from "../forms/EditPartsReqForm"
import { PartsReq } from "../../types/partsReq"

interface Props {
    partsReq: PartsReq,
    open: boolean,
    setActivePartsReq: React.Dispatch<React.SetStateAction<PartsReq | null>>
}

export default function EditDialog(props: Props) {
    const { partsReq, open, setActivePartsReq } = props

    const handleClose = () => {
        setActivePartsReq(null)
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
                Edit Parts Requisition #{partsReq.id}
            </DialogTitle>
            <DialogContent sx={{ padding: "0px" }}>
                <EditPartsReqForm
                    partsReq={partsReq}
                    setActivePartsReq={setActivePartsReq}
                />
            </DialogContent>
            <DialogActions />
        </Dialog>
    ))
}