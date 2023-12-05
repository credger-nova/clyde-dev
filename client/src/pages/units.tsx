import useFetch from "../hooks/useFetch"
import UnitStatus from "../components/UnitStatus"

function Units() {
    const { data: unitParameters } = useFetch(`${import.meta.env.VITE_API_BASE}/parameter/status`)

    return (
        <div className="page-container">
            <UnitStatus
                parameters={unitParameters}
            />
        </div>
    )
}

export default Units