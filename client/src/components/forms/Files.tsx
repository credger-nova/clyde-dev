import * as React from "react"

import { useDownloadFile, useGetFileStream, useSoftDeleteFile } from "../../hooks/storage"

import { File as IFile } from "../../types/file"
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import ListItemText from "@mui/material/ListItemText"
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'

interface Props {
    newFiles: Array<File>,
    setNewFiles: React.Dispatch<React.SetStateAction<Array<File>>>,
    files: Array<IFile>,
    folder: string
}

export default function Files(props: Props) {
    const { newFiles, setNewFiles, files, folder } = props

    const { mutateAsync: downloadFile } = useDownloadFile()
    const { mutateAsync: getFileStream } = useGetFileStream()
    const { mutateAsync: softDeleteFile } = useSoftDeleteFile()

    const handleRemoveNewFile = (index: number) => {
        const tempFiles = [...newFiles]
        tempFiles.splice(index, 1)
        setNewFiles(tempFiles)
    }

    const handleDownload = async (file: IFile) => {
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
        <div
            style={{ marginTop: "10px" }}
        >
            {newFiles ?
                <React.Fragment>
                    <List
                        dense
                    >
                        {Array.from(newFiles).map((file, index) => {
                            return (
                                <React.Fragment>
                                    <ListItem
                                        key={`${index} - ${file.name}`}
                                        sx={{ padding: "5px", marginBottom: "5px", borderRadius: "0.25rem", backgroundColor: "background.paper" }}
                                    >
                                        <ListItemText>{file.name}</ListItemText>
                                        <div
                                            style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
                                        >
                                            <p
                                                style={{
                                                    color: "lawngreen",
                                                    margin: "0px",
                                                    padding: "0px 5px",
                                                    border: "2px solid green",
                                                    borderRadius: "1rem",
                                                    fontWeight: "bold",
                                                    backgroundColor: "#00800030",
                                                    height: "fit-content"
                                                }}
                                            >
                                                New
                                            </p>
                                            <IconButton
                                                disableRipple
                                                onClick={() => handleRemoveNewFile(index)}
                                                sx={{ padding: "5px" }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </div>
                                    </ListItem>
                                </React.Fragment>
                            )
                        })}
                    </List>
                </React.Fragment> : null
            }
            <List
                dense
            >
                {files.map((file, index) =>
                    !file.isDeleted &&
                    <ListItem
                        key={`${index} - ${file.name}`}
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
        </div>
    )
}