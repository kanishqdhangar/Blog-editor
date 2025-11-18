import axios from 'axios';

const API = axios.create({
  baseURL: 'https://blog-editor-ray6.onrender.com/',
});

export default API;
