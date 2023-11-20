import useFetch from "../hooks/useFetch"
import UnitStatus from "../components/UnitStatus"

function Units() {
    const { data, loading } = useFetch(`${import.meta.env.VITE_API_BASE}/unit`)
    console.log(data)

    return (
        <>
            <h2>{loading ? "Loading..." : "Unit Status Page"}</h2>
            <UnitStatus
                units={data ? data : []}
            />
        </>
    )
}

export default Units