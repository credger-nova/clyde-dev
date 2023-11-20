import useFetch from "../hooks/useFetch"

function Units() {
    const { data, loading } = useFetch(`${import.meta.env.VITE_API_BASE}/unit`)
    console.log(data)

    return (
        <>
            <h2>{loading ? "Loading..." : "Unit Status Page"}</h2>
        </>
    )
}

export default Units