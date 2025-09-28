import axios from 'axios';

export const api = axios.create({
  baseURL: '', // use same origin + dev proxy
  timeout: 10000,
  withCredentials: true,
});
