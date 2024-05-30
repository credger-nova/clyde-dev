import UnitStatus from "../components/unit-status/UnitStatus"

import { useAuth0Token } from "../hooks/utils"
import { useStatuses } from "../hooks/parameter"

export default function Units() {
    const token = useAuth0Token()

    const { data: unitStatuses } = useStatuses(token)

    return (
        <div className="page-container">
            <UnitStatus
                parameters={unitStatuses}
            />
        </div>
    )
}