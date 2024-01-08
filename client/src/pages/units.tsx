import UnitStatus from "../components/unit-status/UnitStatus"
import { useStatuses } from "../hooks/parameter"

export default function Units() {
    const { data: unitStatuses } = useStatuses()

    return (
        <div className="page-container">
            <UnitStatus
                parameters={unitStatuses}
            />
        </div>
    )
}