import * as React from "react"
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { PartsReq } from "../../types/partsReq"
import EditPartsReqForm from "../forms/EditPartsReqForm"

interface Props {
    partsReq: PartsReq,
    open: boolean,
    setActivePartsReq: React.Dispatch<React.SetStateAction<PartsReq | null>>
}

export default function EditDialog(props: Props) {
    const handleClose = () => {
        props.setActivePartsReq(null)
    }

    return (props.open && (
        <Dialog
            open={props.open}
            onClose={handleClose}
        >
            <DialogTitle>Edit Parts Requisition #{props.partsReq.id}</DialogTitle>
            <DialogContent>
                <EditPartsReqForm
                    partsReq={props.partsReq}
                    setActivePartsReq={props.setActivePartsReq}
                />
            </DialogContent>
        </Dialog>
    ))
}