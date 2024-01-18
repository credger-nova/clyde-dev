import * as React from "react"
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import EditPartsReqForm from "../forms/EditPartsReqForm"
import { usePartsReq } from "../../hooks/partsReq"

interface Props {
    partsReqId: number,
    open: boolean,
    setActivePartsReqId: React.Dispatch<React.SetStateAction<number | null>>
}

export default function EditDialog(props: Props) {
    const { partsReqId, open, setActivePartsReqId } = props

    const { data: partsReq } = usePartsReq(partsReqId)

    const handleClose = () => {
        setActivePartsReqId(null)
    }

    return (partsReq && (
        <Dialog
            open={open}
            onClose={handleClose}
            sx={{
                "& .MuiDialog-paper": {
                    minWidth: "90vw"
                }
            }}
        >
            <DialogTitle sx={{ textAlign: "center" }}>Edit Parts Requisition #{partsReq.id}</DialogTitle>
            <DialogContent>
                <EditPartsReqForm
                    partsReq={partsReq}
                    setActivePartsReqId={setActivePartsReqId}
                />
            </DialogContent>
            <DialogActions />
        </Dialog>
    ))
}