import Box from "@mui/material/Box"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"

interface Props {
    target: string
    menu: Array<string>
    item: string
    setItem: React.Dispatch<React.SetStateAction<string>>
}

export default function TargetDropdownMenu(props: Props) {
    const { target, menu, item, setItem } = props
    const menuItems = menu.map((menuItem: string) => {
        return (
            <MenuItem key={menuItem} value={menuItem}>
                {menuItem}
            </MenuItem>
        )
    })

    const handleChange = (event: SelectChangeEvent) => {
        setItem(event.target.value as string)
    }

    return (
        <Box sx={{ width: 200 }}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Region</InputLabel>
                <Select labelId="demo-simple-select-label" id="demo-simple-select" value={item} label={target} onChange={handleChange}>
                    {menuItems}
                </Select>
            </FormControl>
        </Box>
    )
}
