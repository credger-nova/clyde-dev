import * as React from "react"
import Button from '@mui/material/Button'
import theme from '../../css/theme'

interface Props {
    setNewFiles: React.Dispatch<React.SetStateAction<Array<File>>>
}

export default function AddFileButton(props: Props) {
    const { setNewFiles } = props

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const fileList = (e.target as HTMLInputElement).files
        const files = fileList ? [...fileList] : []

        setNewFiles((prevState) => [...prevState, ...files])
    }

    return (
        <Button
            variant="contained"
            component="label"
            sx={{ width: "100%", backgroundColor: theme.palette.primary.dark, marginBottom: "5px" }}
        >
            Add Document(s)
            <input
                type="file"
                multiple
                accept="application/pdf"
                onChange={handleFileChange}
                onClick={(event) => (event.target as HTMLInputElement).value = ""} // Clear value
                hidden
            />
        </Button>
    )
}