import { NovaUser } from '../../../types/novaUser'
import { TITLES } from "../../../utils/titles"

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Unstable_Grid2'
import SummaryTable from './SummaryTable'

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#242424",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "left",
    color: "white"
}))

const ALLOWED_GROUPS = [
    "Field Service",
    "Ops Manager",
    "Ops Director",
    "SVP",
    "Supply Chain",
    "Supply Chain Management",
    "Admin",
    "Executive Management",
    "IT"
]

interface Props {
    novaUser: NovaUser
}

export default function PartsReqSummary(props: Props) {
    const { novaUser } = props
    const userType = TITLES.find(item => item.titles.includes(novaUser.title))

    return (
        userType && ALLOWED_GROUPS.includes(userType.group) &&
        <Item>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                <h4 style={{ margin: 0, width: "100%", textAlign: "center" }}>Parts Requisitions</h4>
                <Divider sx={{ width: "100%", marginBottom: "10px" }} />
                <Grid container direction={userType.group === "Supply Chain Management" ? "row" : "column"}>
                    <SummaryTable
                        novaUser={novaUser}
                        group={userType.group}
                    />
                </Grid>
            </Box>
        </Item>
    )
}