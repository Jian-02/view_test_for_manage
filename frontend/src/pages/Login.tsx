import React, {useState} from 'react';
import LogoCTR from '../images/logo_ctr.svg'
import user from '../images/user.svg'
import './Login.css'
import { useNavigate, Link } from 'react-router-dom';
const LoginPage: React.FC = () => {
	const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Username:', username);
    console.log('Password:', password);
		console.log('Remember Me:', rememberMe);
		navigate('/'); 
  };
  return (
    <div className='login-layout'>
    <img src={LogoCTR} alt="Factory Icon" className="login-icon" />
    <span className="login-title">PikeView</span>
    <span className="login-subtitle">공장 모니터링 시스템</span>
    <span className="login-version">v1.2.3</span>
    <div className='login-form'>
    <div className="login-form-title">
      <img src={user} alt="Factory Icon" className="nav-icon" />
      <span>관리자 로그인</span>
    </div>
    <form onSubmit={handleLogin} className="login-form-content">
      <label htmlFor="username" className='input-label'>아이디</label>
      <input
        type="text"
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <label htmlFor="password" className='input-label'>비밀번호</label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <div className='row-layout'>
        <div className="left-side">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe">아이디 저장</label>
        </div>
        <Link to="/reset-password" className="forgot-password-link">비밀번호를 잊으셨나요?</Link>
      </div>
      <button type="submit" className="login-button">로그인</button>
      </form>
        </div>
      </div>
  );
};

export default LoginPage;