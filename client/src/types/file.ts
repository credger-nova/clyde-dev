export interface File {
    id: string,
    name: string,
    partsReqId: string,
    isDeleted: boolean
}

export interface FileDownloadQuery {
    bucket: string,
    fileName: string
}