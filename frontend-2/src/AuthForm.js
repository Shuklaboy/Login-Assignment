import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './AuthForm.css'; // Optional custom styling

const AuthForm = ({ type }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });

    const [message, setMessage] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // ✅ Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return setMessage("⚠️ Invalid email format.");
        }

        // ✅ Password strength validation
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            return setMessage("⚠️ Password must be at least 8 characters and include a number and special character.");
        }
// ✅ Phone number validation (only for register)
if (type === 'register' && !/^\d{10}$/.test(formData.phone)) {
    return setMessage("⚠️ Phone number must be exactly 10 digits.");
}
        try {
            const endpoint = type === 'register' ? 'http://localhost:5000/register' : 'http://localhost:5000/login';
            const response = await axios.post(endpoint, formData);

            setMessage(response.data.message || '✅ Success');

            if (type === 'login' && response.data.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard');
            }

            if (type === 'register') {
                setIsVerifying(true);
            }

        } catch (error) {
            const errMsg = error.response?.data?.message || '❌ An unexpected error occurred';
            setMessage(errMsg);
        }
    };

    return (
        <div className="auth-form-container">
            <h2>{type === 'register' ? 'Register' : 'Login'}</h2>

            <form onSubmit={handleSubmit} className="auth-form">
                {type === 'register' && (
                    <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
                )}
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                {type === 'register' && (
                    <input type="text" name="phone" placeholder="Phone" onChange={handleChange} required />
                )}
                <button type="submit">{type === 'register' ? 'Register' : 'Login'}</button>
            </form>

            {type === 'register' && isVerifying && (
                <p className="info-message">📩 A verification email has been sent. Please check your inbox.</p>
            )}

            {message && <p className="message">{message}</p>}

            <div className="toggle-auth">
                {type === 'register' ? (
                    <p>Already have an account? <Link to="/">Login here</Link></p>
                ) : (
                    <p>Don't have an account? <Link to="/register">Register here</Link></p>
                )}
            </div>
        </div>
    );
};

export default AuthForm;
