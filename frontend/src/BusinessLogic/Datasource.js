import axios from "axios";

export default axios.create({
    baseURL: 'https://resume-api-chi.vercel.app/'
    //baseURL: 'http://localhost:5000'
});