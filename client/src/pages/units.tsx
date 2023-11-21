import useFetch from "../hooks/useFetch"
import UnitStatus from "../components/UnitStatus"

function Units() {
    const { data: unitParameters, loading } = useFetch(`${import.meta.env.VITE_API_BASE}/parameter`)
    console.log(unitParameters)

    return (
        <>
            <h2>{loading ? "Loading..." : "Unit Status Page"}</h2>
            <UnitStatus
                parameters={unitParameters}
            />
        </>
    )
}

export default Units