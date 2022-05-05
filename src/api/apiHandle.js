import axios from "axios"

// const BASE_URL="http://localhost:3006/api"
const BASE_URL="https://joshssnakegame.herokuapp.com/api"

export const publicRequest=axios.create({
    baseURL:BASE_URL
})