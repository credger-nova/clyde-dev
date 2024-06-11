import * as React from "react"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import { STATUS_GROUPS } from "../lookupTables"

interface Props {
    target: string
    setTarget: React.Dispatch<React.SetStateAction<string>>
    setMenu: React.Dispatch<React.SetStateAction<string[]>>
    setItem: React.Dispatch<React.SetStateAction<string>>
    regionList: Array<string>
}

export default function TargetToggleButton(props: Props) {
    const { target, setTarget, setMenu, setItem, regionList } = props
    const statusList = STATUS_GROUPS

    const handleChange = (_event: React.MouseEvent<HTMLElement>, newTarget: string) => {
        if (newTarget === null) {
            return null
        }

        setTarget(newTarget)
        if (newTarget === "region") {
            setMenu(regionList)
            setItem(regionList[0])
        } else {
            setMenu(statusList)
            setItem(statusList[0])
        }
    }

    return (
        <ToggleButtonGroup color="primary" value={target} exclusive onChange={handleChange} aria-label="Platform">
            <ToggleButton value="region">Region</ToggleButton>
            <ToggleButton value="status">Status</ToggleButton>
        </ToggleButtonGroup>
    )
}
