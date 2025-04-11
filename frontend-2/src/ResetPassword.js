import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`http://localhost:5000/reset-password/${token}`, { newPassword });
            setMessage(res.data.message);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Reset Password</h2>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
            <button type="submit">Reset</button>
            <p>{message}</p>
        </form>
    );
};

export default ResetPassword;
