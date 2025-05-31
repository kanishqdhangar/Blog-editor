import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/blogs',
});

export default API;
