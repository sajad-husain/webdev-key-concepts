import axios from "axios";

const url = 'http://localhost:3001/notes'

const getAll = () => {
    const request = axios.get(url)
    return request.then(response => response.data)
}

const create = (newObj) => {
    const request = axios.post(url, newObj)
    return request.then(response => response.data)
}

const update = (id, newObj) => {
    const request = axios.put(`${url}/${id}`, newObj)
    return axios.put(`${url}/${id}`, newObj)
}

export default { getAll, create, update }
