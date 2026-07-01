import axios from "axios";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export  const scheduleVisit=async(visit:any)=>{
    try {
        const response=await axios.post(`${API_BASE_URL}/Visits`,visit)
        return response.data
    } catch (error) {
        console.error("Error scheduling visit:", error)
        throw error
    }
}

