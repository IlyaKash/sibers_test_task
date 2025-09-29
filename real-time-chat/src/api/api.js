import axios from 'axios';

const BASE = 'http://localhost:4000';

// Simple API helper for fetching users
export const fetchUsers = async () => {
    const res = await axios.get(`${BASE}/api/users`);
    return res.data;
};
