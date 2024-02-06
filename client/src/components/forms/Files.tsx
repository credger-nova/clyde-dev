import { useGenerateSignedURL } from "../../hooks/storage"

import { File } from "../../types/file"
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import ListItemText from "@mui/material/ListItemText"
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'

interface Props {
    files: Array<File>,
    folder: string,
    downloadable?: boolean
}

export default function Files(props: Props) {
    const { files, folder, downloadable } = props

    const { mutateAsync: generateSignedURL } = useGenerateSignedURL()

    const handleDownload = async (file: File) => {
        const url = await generateSignedURL({
            bucket: import.meta.env.VITE_BUCKET,
            fileName: `${folder}/${file.id}.${file.name.split(".").pop()}`
        })

        console.log(url)
    }

    return (
        <List
            dense
        >
            {files.map((file) =>
                <ListItem
                    key={file.id}
                    sx={{ padding: "5px", marginBottom: "5px", borderRadius: "0.25rem", backgroundColor: "background.paper" }}
                >
                    <ListItemText>{file.name.split("/").pop()}</ListItemText>
                    <div
                        style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                        {downloadable ?
                            <IconButton
                                disableRipple
                                onClick={() => handleDownload(file)}
                                sx={{ padding: "5px" }}
                            >
                                <DownloadIcon />
                            </IconButton> : null}
                        <IconButton
                            disableRipple
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