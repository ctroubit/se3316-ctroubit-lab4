import React, { useState } from "react";
import './login.css';

function Login({ close }) {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [userData, setUserData] = useState({ username: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password
        }),
      });

      if (response.ok) {
        console.log('Login successful');
        alert('Login successful')
      } else {
        console.log('Login failed');
        // Handle login failure here (e.g., show an error message)
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle network error here
    }
  };

  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    if (userData.password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        console.log('Account created successfully');
        setIsCreatingAccount(false);
      } else {
        console.log('Failed to create account');
      }
    } catch (error) {
      console.error('Error:', error);
    }

    setPasswordError('');
  };

  return (
    <div className="login-box" id='login-box'>
      <h2>{isCreatingAccount ? "Create an Account" : "Login"}</h2>
      {isCreatingAccount ? (
        <form onSubmit={handleCreateAccountSubmit}>
          <div className="user-box">
            <label className='user-label'>Username</label>
            <input type="text" name="username" required onChange={handleChange} />
          </div>
          <div className="user-box">
            <label className='user-label'>Email</label>
            <input type="email" name="email" required onChange={handleChange} />
          </div>
          <div className="user-box">
            <label className='user-label'>Password</label>
            <input type="password" name="password" required onChange={handleChange} />
          </div>
          <div className="user-box">
            <label className='user-label'>Confirm Password</label>
            <input type="password" name="confirmPassword" required onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          {passwordError && <p className="error-message">{passwordError}</p>}
          <button type="submit" className="login-button">Create Account</button>
        </form>
      ) : (
        <form onSubmit={handleLoginSubmit}>
          <div className="user-box">
            <label className='user-label'>Username</label>
            <input type="text" name="username" required onChange={handleChange} />
          </div>
          <div className="user-box">
            <label className='user-label'>Password</label>
            <input type="password" name="password" required onChange={handleChange} />
          </div>
          <button type="submit" className="login-button">Login</button>
          <button type="button" onClick={() => setIsCreatingAccount(true)}>Create an Account</button>
        </form>
      )}
      <br />
      <button type="button" onClick={() => setIsCreatingAccount(false)}>Back</button>
      <button type="button" onClick={close} className="close-button">Cancel</button>
    </div>
  );
}

export default Login;
