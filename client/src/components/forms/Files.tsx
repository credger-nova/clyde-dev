import * as React from "react"

import { useGetSignedURL } from "../../hooks/storage"

import { File as IFile } from "../../types/file"
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import ListItemText from "@mui/material/ListItemText"
import DeleteIcon from '@mui/icons-material/Delete'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import DownloadIcon from '@mui/icons-material/Download'

interface Props {
    newFiles: Array<File>,
    setNewFiles: React.Dispatch<React.SetStateAction<Array<File>>>,
    files: Array<IFile>,
    deleteFiles: Array<string>,
    setDeleteFiles: React.Dispatch<React.SetStateAction<Array<string>>>,
    folder: string,
    disabled: boolean
}

export default function Files(props: Props) {
    const { newFiles, setNewFiles, files, deleteFiles, setDeleteFiles, folder, disabled } = props

    const { mutateAsync: getSignedURL } = useGetSignedURL()

    const handleRemoveNewFile = (index: number) => {
        const tempFiles = [...newFiles]
        tempFiles.splice(index, 1)
        setNewFiles(tempFiles)
    }

    const handleDownload = async (file: IFile) => {
        const signedURL = await getSignedURL({
            bucket: import.meta.env.VITE_BUCKET,
            fileName: encodeURIComponent(`${folder}/${file.id}.${file.name.split(".").pop()}`)
        })

        window.open(signedURL, "_blank")
    }

    const handleDelete = async (id: string) => {
        if (deleteFiles.includes(id)) {
            const index = deleteFiles.indexOf(id)

            const tempRows = [...deleteFiles]
            tempRows.splice(index, 1)
            setDeleteFiles(tempRows)
        } else {
            setDeleteFiles(prevState => [...prevState, id])
        }

    }

    return (
        <div>
            {newFiles ?
                <React.Fragment>
                    <List
                        dense
                        sx={{ padding: "0px" }}
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
                                                disabled={disabled}
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
                sx={{ padding: "0px" }}
            >
                {files ? files.map((file, index) =>
                    !file.isDeleted &&
                    <ListItem
                        key={`${index} - ${file.name}`}
                        sx={{ padding: "5px", marginBottom: "5px", borderRadius: "0.25rem", backgroundColor: "background.paper" }}
                    >
                        <ListItemText>{file.name.split("/").pop()}</ListItemText>
                        <div
                            style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
                        >
                            {deleteFiles.includes(file.id) ? <p
                                style={{
                                    color: "red",
                                    margin: "0px",
                                    padding: "0px 5px",
                                    border: "2px solid red",
                                    borderRadius: "1rem",
                                    fontWeight: "bold",
                                    backgroundColor: "#80000030",
                                    height: "fit-content"
                                }}
                            >
                                Delete
                            </p> : null}
                            {!deleteFiles.includes(file.id) ?
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
                                disabled={disabled}
                                sx={{ padding: "5px" }}
                            >
                                {deleteFiles.includes(file.id) ?
                                    <DeleteForeverIcon /> :
                                    <DeleteIcon />
                                }
                            </IconButton>
                        </div>
                    </ListItem>
                ) : null}
            </List>
        </div>
    )
}