import { useDownloadFile, useGetFileStream, useSoftDeleteFile } from "../../hooks/storage"

import { File } from "../../types/file"
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import ListItemText from "@mui/material/ListItemText"
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'

interface Props {
    files: Array<File>,
    folder: string
}

export default function Files(props: Props) {
    const { files, folder } = props

    const { mutateAsync: downloadFile } = useDownloadFile()
    const { mutateAsync: getFileStream } = useGetFileStream()
    const { mutateAsync: softDeleteFile } = useSoftDeleteFile()

    const handleDownload = async (file: File) => {
        const { data } = await getFileStream({
            bucket: import.meta.env.VITE_BUCKET,
            fileName: encodeURIComponent(`${folder}/${file.id}.${file.name.split(".").pop()}`)
        })
    }

    const handleDelete = async (id: string) => {
        softDeleteFile({
            id
        })
    }

    return (
        <List
            dense
        >
            {files.map((file, index) =>
                !file.isDeleted &&
                <ListItem
                    key={index}
                    sx={{ padding: "5px", marginBottom: "5px", borderRadius: "0.25rem", backgroundColor: "background.paper" }}
                >
                    <ListItemText>{file.name.split("/").pop()}</ListItemText>
                    <div
                        style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                        {file ?
                            <IconButton
                                disableRipple
                                onClick={() => handleDownload(file)}
                                sx={{ padding: "5px" }}
                            >
                                <DownloadIcon />
                            </IconButton> : null}
                        <IconButton
                            disableRipple
                            onClick={() => handleDelete(file.id)}
                            sx={{ padding: "5px" }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </div>
                </ListItem>
            )}
        </List>
    )
}