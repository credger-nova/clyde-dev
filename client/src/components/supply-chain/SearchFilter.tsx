import * as React from "react"

import { StyledTextField } from "../common/TextField"

interface Props {
    searchString: string,
    setSearchString: React.Dispatch<React.SetStateAction<string>>
}

export default function SearchFilter(props: Props) {
    const { searchString, setSearchString } = props

    const handleSearchStringChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log(event.target.value)

        setSearchString(event.target.value)
    }

    return (
        <div style={{ display: "flex" }}>
            <StyledTextField
                variant="standard"
                label="Search"
                type="search"
                onChange={handleSearchStringChange}
                value={searchString}
                sx={{ width: "200px" }}
            />
        </div>
    )
}