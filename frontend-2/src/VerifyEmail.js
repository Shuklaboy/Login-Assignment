// src/VerifyEmail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const { token } = useParams();
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/verify/${token}`);
                setMessage(res.data || "Verification successful");
            } catch (err) {
                setMessage("Invalid or expired verification link.");
            }
        };
        verify();
    }, [token]);

    return (
        <div className="auth-form-container">
            <h2>Email Verification</h2>
            <p>{message}</p>
        </div>
    );
};

export default VerifyEmail;
