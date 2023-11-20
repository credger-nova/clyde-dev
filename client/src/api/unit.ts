import axios from "axios";


const API_BASE = import.meta.env.VITE_API_BASE

export async function getAllUnits() {
    return await axios.get(`${API_BASE}/units`)
}