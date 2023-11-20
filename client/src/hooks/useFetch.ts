import axios from "axios"
import { useState, useEffect } from "react"

const useFetch = (url: string) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: response } = await axios.get(url)
                setData(response)
            } catch (error) {
                console.error(error)
            }
            setLoading(false)
        }

        fetchData()
    }, [url])

    return { data, loading }
}

export default useFetch