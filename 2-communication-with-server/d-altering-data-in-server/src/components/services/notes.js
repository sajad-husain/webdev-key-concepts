import axios from "axios";

const url = 'http://localhost:3001/notes'

const getAll = () => {
    return axios.get(url)
}

const create = (newObj) => {
    return axios.post(url, newObj)
}

const update = (id, newObj) => {
    return axios.put(`${url}/${id}`, newObj)
}

export default {
    getAll: getAll,
    create: create,
    update: update
}
