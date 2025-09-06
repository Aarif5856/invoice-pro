import React, { useEffect, useState } from "react";
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "./firebase/firebase.js";

export default function Auth({ onAuthChange, onUserChange, isLoggingOut } = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessType, setBusinessType] = useState("Individual");
  const [serviceType, setServiceType] = useState("Online");
  const [businessLine, setBusinessLine] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [allowUpdates, setAllowUpdates] = useState(false);

  useEffect(() => {
    console.log('Auth component useEffect called, isLoggingOut:', isLoggingOut);
    
    // Don't auto-authenticate if we're in the middle of logging out
    if (isLoggingOut) {
      console.log('Auth component: skipping auto-auth because isLoggingOut is true');
      return;
    }
    
    // For this application, we'll disable auto-authentication
    // The user needs to manually log in
    console.log('Auth component: no auto-authentication, waiting for user action');
    
    if (auth) {
      const unsub = onAuthStateChanged(auth, u => {
        console.log('Firebase auth state changed:', u);
        setUser(u);
        if (typeof onAuthChange === 'function') onAuthChange(!!u);
        if (typeof onUserChange === 'function') onUserChange(u);
      });
      return () => unsub();
    }
  }, [onAuthChange, isLoggingOut]);

  const handleAuth = async () => {
    setError("");
    
    if (!isLogin) {
      // Signup validation
      if (!firstName.trim()) {
        setError("First name is required");
        return;
      }
      if (!lastName.trim()) {
        setError("Last name is required");
        return;
      }
      if (!email.trim()) {
        setError("Email address is required");
        return;
      }
      if (!password.trim()) {
        setError("Password is required");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    } else {
      // Login validation
      if (!email.trim()) {
        setError("Email address is required");
        return;
      }
      if (!password.trim()) {
        setError("Password is required");
        return;
      }
    }

    try {
      let result;
      if (isLogin) {
        result = await signInWithEmailAndPassword(auth, email, password);
      } else {
        result = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      // Set user from result or create mock user
      const user = result?.user || { 
        uid: 'local-user-' + Date.now(), 
        email: email,
        displayName: isLogin ? null : `${firstName} ${lastName}`
      };
      
      setUser(user);
      if (typeof onAuthChange === 'function') onAuthChange(true);
      
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed');
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setBusinessType("Individual");
    setServiceType("Online");
    setBusinessLine("");
    setError("");
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    if (typeof onAuthChange === 'function') onAuthChange(false);
  };

  if (user) {
    return (
      <div className="auth-container">
        <div className="welcome-container">
          <h2>Welcome to Invoice Pro</h2>
          <p>Hello, {user.email}!</p>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-overlay">
        <div className="auth-modal">
          <div className="auth-header">
            <h2>{isLogin ? 'Sign in' : 'Sign up free'}</h2>
            <button className="close-btn" onClick={() => window.location.reload()}>×</button>
          </div>

          {!isLogin && (
            <>
              <div className="signup-options">
                <p className="signup-label">I am signing up as</p>
                <div className="option-buttons">
                  <button 
                    className={`option-btn ${businessType === 'Individual' ? 'active' : ''}`}
                    onClick={() => setBusinessType('Individual')}
                  >
                    Individual
                  </button>
                  <button 
                    className={`option-btn ${businessType === 'Company' ? 'active' : ''}`}
                    onClick={() => setBusinessType('Company')}
                  >
                    Company
                  </button>
                </div>
              </div>

              <div className="service-options">
                <p className="service-label">Do you sell or provide services online or offline?</p>
                <div className="service-buttons">
                  <button 
                    className={`service-btn ${serviceType === 'Online' ? 'active' : ''}`}
                    onClick={() => setServiceType('Online')}
                  >
                    Online
                  </button>
                  <button 
                    className={`service-btn ${serviceType === 'Offline' ? 'active' : ''}`}
                    onClick={() => setServiceType('Offline')}
                  >
                    Offline
                  </button>
                  <button 
                    className={`service-btn ${serviceType === 'Both' ? 'active' : ''}`}
                    onClick={() => setServiceType('Both')}
                  >
                    Online & Offline
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Business line <span className="required">*</span></label>
                <select 
                  value={businessLine} 
                  onChange={(e) => setBusinessLine(e.target.value)}
                  className="form-select"
                >
                  <option value="">-</option>
                  <option value="retail">Retail</option>
                  <option value="consulting">Consulting</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="finance">Finance</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="hospitality">Hospitality</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="name-row">
                <div className="form-group half">
                  <label>First name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group half">
                  <label>Last name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email address <span className="required">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className={isLogin ? "single-password" : "password-row"}>
            <div className="form-group password-group">
              <label>Password <span className="required">*</span></label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input password-input"
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="form-group password-group">
                <label>Confirm password <span className="required">*</span></label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input password-input"
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="allowUpdates"
                checked={allowUpdates}
                onChange={(e) => setAllowUpdates(e.target.checked)}
              />
              <label htmlFor="allowUpdates">
                Allow Free Invoice Builder to send occasional updates about additional products and services.
              </label>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button onClick={handleAuth} className="auth-submit-btn">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>

          {!isLogin && (
            <div className="terms-text">
              By creating an account you agree to freeinvoicebuilder.com{' '}
              <a href="#" className="terms-link">Terms of Service</a> and{' '}
              <a href="#" className="terms-link">Privacy Policy</a>
            </div>
          )}

          <div className="switch-mode">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <button onClick={toggleMode} className="switch-btn">
                  Sign up free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button onClick={toggleMode} className="switch-btn">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
