import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Forgot Password</h2>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
            <button type="submit">Send Reset Link</button>
            <p>{message}</p>
        </form>
    );
};

export default ForgotPassword;
