import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AuthForm from './AuthForm';
import Dashboard from './Dashboard';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import VerifyEmail from './VerifyEmail';

const App = () => {
    return (
        <Router>
            <nav style={{ padding: '10px', background: '#f3f3f3', marginBottom: '20px' }}>
                {/* <Link to="/" style={{ marginRight: '10px' }}>Login</Link>
                <Link to="/register" style={{ marginRight: '10px' }}>Register</Link> */}
                <Link to="/forgot-password">Forgot Password?</Link>
            </nav>
            <Routes>
                <Route path="/" element={<AuthForm type="login" />} />
                <Route path="/register" element={<AuthForm type="register" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify/:token" element={<VerifyEmail />} />
            </Routes>
        </Router>
    );
};

export default App;
