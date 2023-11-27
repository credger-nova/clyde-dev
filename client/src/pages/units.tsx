import useFetch from "../hooks/useFetch"
import UnitStatus from "../components/UnitStatus"

function Units() {
    const { data: unitParameters, loading } = useFetch(`${import.meta.env.VITE_API_BASE}/parameter/status`)

    return (
        <div className="page-container">
            <h2>{loading ? "Loading..." : "Unit Status Page"}</h2>
            <UnitStatus
                parameters={unitParameters}
            />
        </div>
    )
}

export default Units