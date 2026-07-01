import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { BarChart, DonutChart}  from '../components/Charts';
import { ok } from 'assert';
import { Bar } from '@nivo/bar';
import graph from '../images/graph_a.svg'
import titleImage from '../images/title_01.svg'
import loadingGif from '../images/loading.gif'
import arrowM from '../images/arrow_M.svg'
import axios from 'axios'
import { WebSocketComponent } from '../components/Websocket';
import ResponsiveAnimatedNumber from '../components/Numberanimation';

interface DynamicChartData {
  Part: string;
  OK: number;
  NG: number;
}
interface DynamicChartProps {
    index: number;
    data: DynamicChartData;
  }

const DynamicChart: React.FC<DynamicChartProps> = ({ index, data }) => {
  const [chartData, setChartData] = useState([
    {
      id: 'pikezone' + (index + 1),
      data: [
        { x: 'OK', y: data["OK"] },
        { x: 'NG', y: data["NG"] },
      ],
    },
  ]);

  useEffect(() => {
    setChartData([
      {
        id: 'pikezone' + (index + 1),
        data: [
          { x: 'OK', y: data["OK"] },
          { x: 'NG', y: data["NG"] },
        ],
      },
    ]);
  }, [data["OK"], data["NG"], index]);
  return <DonutChart data={chartData} />;
};

interface DynamicTextProps {
  text: string;
}

const DynamicText: React.FC<DynamicTextProps> = ({ text }) => {
  const [fontSize, setFontSize] = useState<number>(16);  // 초기 글자 크기

  useEffect(() => {
    const length = text.length;
    // 문자열의 길이에 비례하여 글자 크기 설정 (예시: 16px에서 시작해서 길이에 따라 커짐)
    const newFontSize = Math.min(1.0, 7/length)   ;
    setFontSize(newFontSize);
  }, [text]);  // text가 변경될 때마다 글자 크기 업데이트

  return (
    <div style={{ fontSize: `${fontSize}vw`, justifyContent: `center` }}>
      {text}
    </div>
  );
};


const Home: React.FC = () => {
  const navigate = useNavigate();
  var [counts, setCounts] = useState<{ Part: string, OK: number; NG: number }[]>([
    { Part: 'CABJ', OK: 0, NG: 0 },
    { Part: 'CABJ', OK: 0, NG: 0 },
    { Part: 'CABJ', OK: 0, NG: 0 },
    { Part: 'CABJ', OK: 0, NG: 0 },
    { Part: 'CABJ', OK: 0, NG: 0 },
    { Part: 'CABJ', OK: 0, NG: 0 },
    { Part: 'CABJ', OK: 0, NG: 0 },
    { Part: 'CABJ', OK: 0, NG: 0 }
  ]);
  
  const [webSocketData, setWebSocketData] = useState<Record<number, any>>({});
  const [loadingList, setLoadingList] = useState<boolean[]>([true, true, true, true, true, true, true, true]);
  const [isActiveList, setIsActiveList] = useState<boolean[]>(Array(10).fill(false));

  const handleWebSocketData = (data: Record<string, any>) => {
    const clientName = data["ClientName"];
    const lastChar = clientName.slice(-1);
    const index = parseInt(lastChar, 10)-1;

    setLoadingList((prevLoadingList) => {
      const newLoadingList = [...prevLoadingList];
      newLoadingList[index] = false; 
      return newLoadingList; 
    });

    setCounts((prevCounts) => {
      const newCounts = [...prevCounts];
      newCounts[index] = {
        Part: data["Part"],
        OK: data["OK"], 
        NG: data["NG"], 
      };
      return newCounts; 
    });
  };

  const handleClick = (index: number) => {
    navigate(`/contact/inference_data_${index+1}`);
  }

  return (
    <div className="home-layout">
      <div className='home-title'>
        <img src={titleImage} alt="HomeTitle" className="home-title-img" />
        <div className="home-title-text">홈 대시보드</div>
      </div>
      <div className="grid-container">
        <WebSocketComponent onData={(data) => handleWebSocketData(data)}/>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={`grid-item ${isActiveList[index] ? 'active' : ''}`} onClick={() => handleClick(index)}>
            <div className="content-title">
              <div className="content-title-left">
                <img src={graph} alt="Factory Icon" className="nav-icon" />
                <span>PikeZone {index + 1}</span>
              </div>
              <div className="content-title-right">
                <img src={arrowM} alt="Factory Icon" className="arrowM" />
              </div>
            </div>
            <div className="container">
            <div className="content-inner">
              <div className="inner-left">
                <DynamicChart index={index} data={counts[index]} />
              </div>
              <div className="inner-right">
                <div className="inner-right-center">
                  <div className="inner-right-box">
                    <div>부품 타입</div>
                    <div className='text-grid' ><DynamicText text={counts[index]["Part"]} /></div>
                  </div>
                  <div className="inner-right-box">
                    <div>검사 수량</div>
                    <div className='text-grid'>
                      <ResponsiveAnimatedNumber value={counts[index]["OK"]+counts[index]["NG"]} fhdsize={20} duration={500}/>
                    </div>
                  </div>
                  <div className="inner-right-box">
                    <div>양품</div>
                    <div className='num-ok-grid'>
                      <ResponsiveAnimatedNumber value={counts[index]["OK"]} fhdsize={20} duration={500}/>
                    </div>
                  </div>
                  <div className="inner-right-box">
                    <div>불량</div>
                    <div className='num-ng-grid'>
                      <ResponsiveAnimatedNumber value={counts[index]["NG"]} fhdsize={20} duration={500}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {loadingList[index] && (
            <div className="overlay">
              <img
                src={loadingGif}
                alt="Loading..."
                className="loading-gif"
              />
            </div>
            )}
          </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
