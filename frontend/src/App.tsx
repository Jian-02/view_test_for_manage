import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Alert from './pages/Alert';
import './App.css';
import LogoCTR from './images/logo_ctr.svg'
import LogoITis from './images/logo_itis.svg'
import alert from './images/alert_a.svg'
import user from './images/user.svg'
import gnb1 from './images/gnb_1_a.svg'
import gnb2 from './images/gnb_2_a.svg'
import gnb3 from './images/gnb_3_a.svg'
import ModalComponent from './components/Popup';
import LoginPage from './pages/Login';
import ResetPassword from './pages/ResetPassword'
import { useNavigate } from 'react-router-dom';
import DatetimeDisp from './components/Datetime'
import { AlertSocketComponent } from './components/Websocket';
import { json } from 'stream/consumers';
import { parse } from 'path';
import { GlobalProvider, useGlobalContext } from './components/Context';



const AppLayout: React.FC = () => {
  const location = useLocation();
  const hiddenNavPaths = ['/login', '/register', '/reset-password'];
  const shouldShowNav = !hiddenNavPaths.includes(location.pathname);

  return (
    <GlobalProvider>
      <div className="app-layout">
      {shouldShowNav && <Nav />} 
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/contact" element={<Contact />} /> */}
          <Route path="/contact/:id" element={<Contact />} />
          <Route path="/alert" element={<Alert />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </main>
    </div>
    </GlobalProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};
const Nav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { count, setCount } = useGlobalContext();
  const logout = () => {
    const confirmed = window.confirm("로그아웃 하시겠습니까?");
    if (confirmed) {
      navigate('/login'); 
    } else {
      console.log("로그아웃 취소");
    }

  };

  useEffect(() => {
    if (location.pathname === '/login') {
      console.log('Logged out, on the login page');
    }
  }, [location]);

  const isLinkActive = (path: string) => location.pathname === path;

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [divs, setDivs] = useState<JSX.Element[]>([]);
  const [number, setNumber] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);

  interface IncrementingNumberProps {
    number: number; 
  }
  
  const IncrementingNumber: React.FC<IncrementingNumberProps> = ({ number }) => {
    const colorClass = number === 0 ? 'white-text' : 'red-text';
    return <span className={colorClass}>{number}</span>;
  };

  interface AlertData {
		ClassName: string;
		ClientName: string;
		Text: string;
		Datetime: string;
	}

const handleNewData = (jsonList: Array<Record<string, any>>) => {
  var updatedDivs: JSX.Element[] = []
  const storedData = JSON.parse(localStorage.getItem("alertData") || "[]") as AlertData[];
  setCount(storedData.filter((data) => data.ClassName === 'alert-content').length)
  const parsedDivs = storedData.map((data: AlertData) => (
    <div className={data.ClassName} key={data.Datetime+'-'+data.ClientName}>
      <div className="name">{data.ClientName}</div>
      <div className="detail">{data.Text}</div>
      <div className="datetime">{data.Datetime}</div>
    </div>
  ));
  setDivs(() => {
    if ((storedData.length) != jsonList.length) {
      localStorage.clear()
      updatedDivs = jsonList.map((jsonData, index) =>
      React.createElement(
        'div',
        { className: 'alert-content', key: `${jsonData.Datetime}-${index}` },
        React.createElement('div', { className: 'name' }, jsonData.ClientName),
        React.createElement('div', { className: 'detail' }, jsonData.Text),
        React.createElement('div', { className: 'datetime' }, jsonData.Datetime)
      ));
      const alertDataToStore = updatedDivs.map((div) => ({
      ClassName: div.props.className,
      ClientName: div.props.children[0].props.children,
      Text: div.props.children[1].props.children,
      Datetime: div.props.children[2].props.children,
    }));
    localStorage.setItem('alertData', JSON.stringify(alertDataToStore));
  }
  else {
    const newDivs = jsonList.map((jsonData, index) =>
      React.createElement(
        'div',
        { className: 'alert-content', key: `${jsonData.Datetime}-${index}` },
        React.createElement('div', { className: 'name' }, jsonData.ClientName),
        React.createElement('div', { className: 'detail' }, jsonData.Text),
        React.createElement('div', { className: 'datetime' }, jsonData.Datetime)
      ));
    updatedDivs = [newDivs[0], ...parsedDivs];
    if (updatedDivs.length > 50) {
    updatedDivs.pop();
    }
    const alertDataToStore = updatedDivs.map((div) => ({
    ClassName: div.props.className,
    ClientName: div.props.children[0].props.children,
    Text: div.props.children[1].props.children,
    Datetime: div.props.children[2].props.children,
    }));
    localStorage.setItem('alertData', JSON.stringify(alertDataToStore));
  }
    return updatedDivs;
  });
};

interface AlertData {
  ClassName: string;
  ClientName: string;
  Text: string;
  Datetime: string;
}

useEffect(() => {
  const storedData = JSON.parse(localStorage.getItem("alertData") || "[]") as AlertData[];
  const parsedDivs = storedData.map((data: AlertData) => (
    <div className={data.ClassName} key={data.Datetime}>
      <div className="name">{data.ClientName}</div>
      <div className="detail">{data.Text}</div>
      <div className="datetime">{data.Datetime}</div>
    </div>
  ));

  setDivs(parsedDivs);

  return () => {
    console.log('Component unmounted');
  };
}, []);

  const openModal = () => {
    setIsModalOpen(true);
    const storedData = JSON.parse(localStorage.getItem("alertData") || "[]") as AlertData[];
    const parsedDivs = storedData.map((data: AlertData) => (
      <div className={data.ClassName} key={data.Datetime}>
        <div className="name">{data.ClientName}</div>
        <div className="detail">{data.Text}</div>
        <div className="datetime">{data.Datetime}</div>
      </div>
    ));
  
    setDivs(parsedDivs);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // setNumber(0);
    // setDivs((prevDivs) =>
    //   prevDivs.map((div) =>
    //     React.cloneElement(div, {
    //       className: 'alert-content-close',
    //     })
    //   )
    // );
  };
  
  return (
    <nav className="nav">
      <div className="nav-left">
        <img src={LogoITis} alt="Factory Icon" className="nav-title-icon" />
        <span className="nav-title">공장 모니터링 시스템</span>
      </div>
      <div className="nav-center">
        <ul>
          <li>
            <Link to="/"  className={`link-item ${isLinkActive('/') ? 'active' : ''}`}>
              <img src={gnb1} alt="Factory Icon" className="nav-icon" />
              <span className="nav-text">홈 대시보드</span>
            </Link>
          </li>
        </ul>
      </div>
      <div className="nav-right">
        <div className='nav-datetime'>
          <DatetimeDisp />
        </div>
        <button className={`nav-alert-button ${isLinkActive('/Alert') ? 'active' : ''}`} onClick={isLinkActive('/Alert') ? undefined : openModal}>
          <img src={alert} alt="Factory Icon" className="nav-icon" />
          <IncrementingNumber number={count} />
      </button>
      <ModalComponent isModalOpen={isModalOpen} closeModal={closeModal} divs={divs} />
      <AlertSocketComponent onData={handleNewData} />
      <button className="nav-logout-button" onClick={logout}>
        <img src={user} alt="Factory Icon" className="nav-icon"/>
        <span className="nav-title">로그아웃</span>
      </button>
      </div>
    </nav>
  );
};
export default App;
