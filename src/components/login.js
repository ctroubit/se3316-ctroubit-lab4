import React, { useState } from "react";
import './login.css';

function Login({ close }) {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
  };

  const handleCreateAccountSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return; 
    }
    
    setPasswordError(''); 
  };

  return (
    <div className="login-box" id='login-box'>
      <h2>{isCreatingAccount ? "Create an Account" : "Login"}</h2>
      {!isCreatingAccount ? (
        <form onSubmit={handleLoginSubmit}>
        <div className="user-box">
        <label className ='user-label'>Username</label>
          <input type="text" name="username" required />
        
        </div>
        <div className="user-box">
      <label className ='user-label'>Password</label>
        <input type="password" name="password" required />
        </div>
        <button type="submit" className="login-button">Login</button>
        <button type="button" onClick={() => setIsCreatingAccount(true)}>Create an Account</button>
      </form>
      ) : (
        <form onSubmit={handleCreateAccountSubmit}>
          
          <div className="user-box">
            <label className='user-label'>Username</label>
            <input type="text" name="username" required />
          </div>
          <div className="user-box">
            <label className='user-label'>Email</label>
            <input type="email" name="email" required />
          </div>
          <div className="user-box">
            <label className='user-label'>Password</label>
            <input type="password" name="password" required onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="user-box">
            <label className='user-label'>Confirm Password</label>
            <input type="password" name="confirmPassword" required onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          {passwordError && <p className="error-message">{passwordError}</p>}
          <button type="submit" className="login-button">Create Account</button>
        </form>
      )}
      <br />
      <button onClick={() => setIsCreatingAccount(false)}>Back</button>
      <button onClick={close} className="close-button">Cancel</button>
    </div>
  );
}

export default Login;
