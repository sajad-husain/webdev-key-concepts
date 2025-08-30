import axios from "axios";

const url = 'http://localhost:3001/notes'

export const getAll = () => {
    return axios.get(url)
}

export const create = (newObj) => {
    return axios.post(url, newObj)
}

export const update = (id, newObj) => {
    return axios.put(`${url}/${id}`, newObj)
}

