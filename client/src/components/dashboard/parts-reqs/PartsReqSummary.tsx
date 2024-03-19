import { NovaUser } from '../../../types/novaUser'
import { TITLES } from "../../../utils/titles"

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
//import SummaryTable from './SummaryTable'

const ALLOWED_GROUPS = [
    "Ops Manager",
    "Ops Director",
    "Supply Chain",
    "Supply Chain Director",
    "IT"
]

interface Props {
    novaUser: NovaUser
}

export default function PartsReqSummary(props: Props) {
    const { novaUser } = props
    const userType = TITLES.find(item => item.titles.includes(novaUser.title))

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <h4 style={{ margin: 0, width: "100%", textAlign: "center" }}>Parts Reqs</h4>
            <Divider sx={{ width: "100%", marginBottom: "10px" }} />
            {userType && ALLOWED_GROUPS.includes(userType.group) && /*<SummaryTable
                novaUser={novaUser}
                group={userType.group}
    />*/null}
        </Box>
    )
}