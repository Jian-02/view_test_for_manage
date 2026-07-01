import React, {useState, useEffect, useContext} from 'react';
import './Alert.css'
import notice from '../images/noti_32.svg'
import { AlertSocketComponent } from '../components/Websocket';
import { useNavigate } from 'react-router-dom';
import {useGlobalContext } from '../components/Context';

interface ModalPageProps {
  divs: JSX.Element[];
}
var count = 0
const Alert: React.FC = () => {
	const [divs, setDivs] = useState<JSX.Element[]>([]);
  const { count, setCount } = useGlobalContext();
  const navigate = useNavigate();

	interface AlertData {
		ClassName: string;
		ClientName: string;
		Text: string;
		Datetime: string;
	}

	const handleNewData = () => {
    const storedData = JSON.parse(localStorage.getItem("alertData") || "[]") as AlertData[];
    
    setDivs(() => {
      const dididiv = storedData.map((data, index) => (
        <div
          key={data.Datetime+'-'+data.ClientName}
          className={data.ClassName}
          onClick={() => handleClick(index)}  // 클릭 시 handleClick 실행
        >
          {/* <div className='name'>{data.ClientName}</div>
          <span>에서</span>
          <span className="text">{data.Text}</span>
          <span> 이(가) 발생하였습니다.</span>
          <div className="datetime">{data.Datetime}</div> */}
          
          <div className='detail'>
            {data.ClassName === 'alert-content' && <div className='red-dot'></div>}
            <div className='name'>{data.ClientName}</div>
            <div>에서</div> 
            <div className='name'>{data.Text}</div>
            <div>이(가) 발생했습니다.</div>
          </div>
          <div className="datetime">{data.Datetime}</div>
        </div>
      ));
      
      return dididiv;
    });

  };


	useEffect(() => {
    handleNewData();
  }, []);

  const handleClick = (index: number) => {
    setDivs(prevDivs => {
      if (index < 0 || index >= prevDivs.length) {
        console.error("Invalid index:", index);
        return prevDivs;
      }
      const updatedDivs = prevDivs.map((div, i) =>
        i === index && div.props.children.className !== 'alert-content-close'  
          ? React.cloneElement(div, { className: 'alert-content-close' })  
          : div
      );
      const alertDataToStore = updatedDivs.map((div) => {
        const clientName = div.props?.children[0]?.props?.children[1].props?.children || "Unknown";
        const text = div.props?.children[0]?.props?.children[3].props?.children  || "";
        const datetime = div.props?.children[1]?.props?.children || "";
        return {
          ClassName: div.props.className,
          ClientName: clientName,
          Text: text,
          Datetime: datetime,                             
        };
      });
      localStorage.setItem("alertData", JSON.stringify(alertDataToStore));
      const newCount = alertDataToStore.filter((data) => data.ClassName === 'alert-content').length;
      setCount(newCount)
      const clientName = updatedDivs[index]?.props?.children[0]?.props?.children[1].props?.children || "Unknown";
      navigate(`/contact/${clientName}`);
  
      return updatedDivs; 
    });
  };
  return (
    <div className='alert-layout'>
      <div className='title-layout'>
        <img src={notice} alt="Factory Icon" className="alert-icon" />
        <span className="alert-title">경고 알림</span>
				<p className="alert-count">{count}</p>
      </div>
      <div className='content-layout'>
        <div className='inner-content'>
			<AlertSocketComponent onData={handleNewData} />
      {divs}
        </div>
      </div>
    </div>
  );
};

export default Alert;
