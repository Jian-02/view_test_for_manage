import {APIEndPoint} from '../config'
import { useParams, useNavigate }  from 'react-router-dom';
import axios from 'axios';
import React, { useState, useEffect, useRef} from 'react';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';
import './Contact.css';
import arrow from '../images/prev_M_b.svg';
import gnb3 from '../images/gnb_3_b.svg'
import gnb3_a from '../images/gnb_3_a.svg'
import dropdown from '../images/arrow_down.svg'
import loadingGif from '../images/loading.gif'
import 'react-calendar/dist/Calendar.css'; 
import {BarChart}  from '../components/Charts';
import { format, startOfDay, endOfDay, parse , setHours, setMinutes, isSameDay } from 'date-fns'
import { DonutChartDetail} from '../components/Charts';
import FileDownloadComponent from '../components/FileDownloadComponent';
import { ko } from "date-fns/locale";

const DefectItem = React.memo(({ item }: { item: any }) => {

  const defectTypeMap: { [key: string]: string } = {
    "H_BootTear": "1차 부트 찢어짐",
    "H_BootCurl": "1차 부트 말림",
    "H_BootBurr": "1차 부트 Burr 유/무",
    "H_BootAssembly": "1차 부트 조립 상태",
    "H_GreaseOut": "1차 목부 그리스 누유",
    "H_PBallDamage": "1차 P/Ball 찍힘 및 긁힘",
    "H_PBallLot": "1차 P/Ball 로트 타각 식별",
    "H_CRingErr": "1차 C/Ring 유/무",
    "H_CRingTwist": "1차 C/Ring 꼬임",
    "H_ORingErr": "1차 O/Ring 유/무",
    "H_ORingTwist": "1차 O/Ring 꼬임",
    "SocketDamage": "소켓 외경 찍힘 및 긁힘",
    "SocketGroove": "소켓 외경 홈 그루브 유무",
    "L_BootTear": "2차 부트 찢어짐",
    "L_BootCurl": "2차 부트 말림",
    "L_BootBurr": "2차 부트 Burr 유/무",
    "L_BootAssembly": "2차 부트 조립 상태",
    "L_GreaseOut": "2차 목부 그리스 누유",
    "L_PBallDamage": "2차 P/Ball 찍힘 및 긁힘",
    "L_CRingErr": "2차 C/Ring 유/무",
    "L_CRingTwist": "2차 C/Ring 꼬임",
    "L_ORingErr": "2차 O/Ring 유/무",
    "L_ORingTwist": "2차 O/Ring 꼬임",
  };

  const activeDefects = Object.keys(defectTypeMap).filter(type => item[type] === "1");
  const formattedDate = format(parse(item.Datetime, 'yyyyMMdd_HHmmss', new Date()), 'yyyy.MM.dd HH:mm:ss');
  if (activeDefects.length === 0) {
    return null; 
  }
  
  return (
    <div className="defect-item">
      <div className='defect-info'>
        <div className='defect-part'><span className='defect-type-text'>타입</span>{item.Part}</div>
        <div className="defect-type">
            {activeDefects.map((defect, index) => (
            <span key={index} className="defect-badge">{defectTypeMap[defect]}</span>
          ))}
        </div>
      </div>
      <div className="defect-date">
        {formattedDate}
      </div>
    </div>
  );
});


const Contact = () => {

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();

  const [unitNumber, setUnitNumber] = useState(id?.replace(/\D/g, ''));
  const [selectedPart, setSelectedPart] = useState('부품 전체');
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [tempStartDate, setTempStartDate] = useState(startOfDay(new Date()));
  const [tempEndDate, setTempEndDate] = useState(endOfDay(new Date()));
  const [chartData, setChartData] = useState({ OK: 0, NG: 0 });
  const [topDefects, setTopDefects] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [okPercent, setOkPercent] = useState(0);
  const [ngPercent, setNgPercent] = useState(0);
  const [dateRange, setDateRange] = useState("기간설정");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeOption, setActiveOption] = useState('금일');
  const [showFirstFive, setShowFirstFive] = useState(true);
  const [activeToggle, setActiveToggle] = useState('first-five');

  const [detailData, setDetailData] = useState<any[]>([]);
  const [displayedItems, setDisplayedItems] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const innerContentRef = useRef<HTMLDivElement | null>(null);

const [maxDefectCount, setMaxDefectCount] = useState(0);

  useEffect(() => {
    setDisplayedItems(detailData.slice(0, 10));
    setHasMore(detailData.length > 10);
}, [detailData]);

  const loadMoreItems = () => {
    if (!hasMore) return;
    
  const currentLength = displayedItems.length;
  const nextItems = detailData.slice(currentLength, currentLength + 10);
  
  console.log("Current displayed items:", displayedItems);
  console.log("Next items to load:", nextItems);
  
  if (nextItems.length > 0) {
    setDisplayedItems(prevItems => {
      const newItems = [...prevItems, ...nextItems];
      console.log("New displayed items:", newItems);
      return newItems;
    });
    setHasMore(currentLength + 10 < detailData.length);
  } else {
    setHasMore(false);
  }
};


  const handleNavigateHome = () => {
    navigate('/');  
  };
  
  const handleScroll = () => {
    if (innerContentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = innerContentRef.current;
      if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore) {
        loadMoreItems();
      }
    }
  };

  useEffect(() => {
    innerContentRef.current?.addEventListener('scroll', handleScroll);
    return () => innerContentRef.current?.removeEventListener('scroll', handleScroll);
  }, [hasMore, displayedItems.length]);

  useEffect(() => {
    const newUnitNumber = id?.replace(/\D/g, '') || '';
    if (newUnitNumber !== unitNumber) {
      setUnitNumber(newUnitNumber);
      setSelectedPart('부품 전체');
      setStartDate(startOfDay(new Date()));
      setEndDate(endOfDay(new Date()));
      setDateRange("기간설정");
      setActiveOption('금일');
      setIsLoading(true);
      fetchData();
    }
  }, [id]);
  useEffect(() => {
    const fetchDataEffect = async () => {
      setIsLoading(true);
      console.log("fetchDataEffect")
      try {
        await fetchData();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDataEffect();
  }, [unitNumber, selectedPart, startDate, endDate]);


  const formatDate = (date: Date) => {
    return format(date, 'yyyyMMdd_HHmm');
  };

  const fetchData = async () => {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    setDisplayedItems([]); 
    setDetailData([]); 
    if(isLoading){  
    try {
          const response = await 
          axios.post(`${APIEndPoint}/detail/api/update_data/${unitNumber}/${selectedPart}/${formattedStartDate}/${formattedEndDate}`);
          const data = response.data;
        if (innerContentRef.current) {
          innerContentRef.current.scrollTop = 0;
        }
        // const filteredData = data.detail_data.filter((item: any) => {
        //   if (selectedPart === '부품 전체') {
        //     return item.Result === "1";
        //   } else {
        //     return item.Result === "1" && item.Part === selectedPart;
        //   }
        // });
        setDetailData(data.detail_data);
        setDisplayedItems(data.detail_data.slice(0, 10)); 
        setHasMore(data.detail_data.length > 10);
        
        setChartData({ OK: data.count_data.OK, NG: data.count_data.NG });       
        const total = data.count_data.ALL;
        setTotalCount(total);

        if (total === 0) {
          setOkPercent(0);
          setNgPercent(0);
        } else {
          setOkPercent(Number(((data.count_data.OK / total) * 100).toFixed(1)));
          setNgPercent(Number(((data.count_data.NG / total) * 100).toFixed(1)));
        }
        setTopDefects(data.top_10_defects);
      
        if (data.top_10_defects && data.top_10_defects.length > 0) {
          setMaxDefectCount(data.top_10_defects[0].불량);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    } 
  }};

  const handleOptionClick = async (option: string) => {
    if (!isLoading && option !== selectedPart) {
      setIsLoading(true);
      setSelectedPart(option);
      setIsDropdownOpen(false);
      try {
        await fetchData();
      } catch (error) {
        console.error('Error fetching data:', error);
      } 
    } else {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (tempEndDate < tempStartDate) {
      setTempEndDate(tempStartDate);
    }
  }, [tempStartDate]);

  const getTimeConstraints = (date: Date, isStart: boolean): { minTime: Date; maxTime: Date } => {
    const today = startOfDay(new Date());
    const isToday = date && startOfDay(date).getTime() === today.getTime();
    const isStartDate = date && isSameDay(date, tempStartDate);
  
    if (isStart) {
      return {
        minTime: isToday ? new Date() : setHours(setMinutes(new Date(), 0), 0),
        maxTime: setHours(setMinutes(new Date(), 59), 23)
      };
    } else {
      if (isStartDate) {
        // 시작 날짜와 같은 날인 경우에만 시간 제한 적용
        return {
          minTime: tempStartDate,
          maxTime: setHours(setMinutes(new Date(), 59), 23)
        };
      } else {
        // 시작 날짜와 다른 날인 경우 시간 제한 없음
        return {
          minTime: new Date(0,0,0,0,0),
          maxTime: setHours(setMinutes(new Date(), 59), 23)
        };
      }
    }
  };


  const handleQuickDateSelection= (option: string, start?: Date, end?: Date) => {
    const now = new Date();
    let newStart: Date;
    let newEnd: Date;
    if (!isLoading) {
    switch (option) {
      case '금일':
        newStart = startOfDay(now);
        newEnd = endOfDay(now);
        break;
      case '일주일':
        newStart = startOfDay(new Date(now.setDate(now.getDate() - 7)));
        newEnd = endOfDay(new Date());
        break;
      case '한달':
        newStart = startOfDay(new Date(now.setMonth(now.getMonth() - 1)));
        newEnd = endOfDay(new Date());
        break;
      case '기간설정':
        newStart = start || startDate;
        newEnd = end || endDate;
        break;
      default:
        return; 
    }
  
    setStartDate(newStart);
    setEndDate(newEnd);
    setDateRange(`${format(newStart, 'yyyy.MM.dd HH:mm')} ~ ${format(newEnd, 'yyyy.MM.dd HH:mm')}`);
    setActiveOption(option); 
    setShowDatePicker(false);
    setIsLoading(true); 
    fetchData();
  }
  };

  const handleToggle = (toggle: string) => {
    setActiveToggle(toggle);
    if (toggle === 'first-five') {
      setShowFirstFive(true);
    } else {
      setShowFirstFive(false);
    }
  };

  return (
    <div className='detail-layout'>
      <div className='detail-top-section'> 
        <div className='unit-number'><img src={arrow}  alt="Arrow Icon" className='detail-nav-icon' onClick={handleNavigateHome}></img><span>{unitNumber}호기</span>
          <div className={`select-component ${isLoading ? 'inactive' : ''}`} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>{selectedPart}<img src={dropdown} alt="dropdown Icon" className='dropdown-icon' />
              {isDropdownOpen && !isLoading && (
                <div className='dropdown-menu'>
                  <div onClick={() => handleOptionClick('부품 전체')}>부품 전체</div>
                    <div onClick={() => handleOptionClick('CABJ')}>CABJ</div>
                    <div onClick={() => handleOptionClick('CABJ_Alpha')}>CABJ_Alpha</div>
                    <div onClick={() => handleOptionClick('CABJ_Alpha_Z')}>CABJ_Alpha_Z</div>
                </div>)} 
            </div>
          </div>
        <div className='select-section'>
          <div className='select-date-wrapper'>
            <div className={`select-today ${activeOption === '금일' ? 'active' : ''} ${isLoading && activeOption !== '금일' ? 'inactive' : ''}`} onClick={() => handleQuickDateSelection('금일')}>금일</div>
            <div className={`select-week ${activeOption === '일주일' ? 'active' : ''} ${isLoading && activeOption !== '일주일' ? 'inactive' : ''}`} onClick={() => handleQuickDateSelection('일주일')}>일주일</div>
            <div className={`select-month ${activeOption === '한달' ? 'active' : ''} ${isLoading && activeOption !== '한달' ? 'inactive' : ''}`} onClick={() => handleQuickDateSelection('한달')}>한달</div>
            <div className={`select-calendar ${activeOption === '기간설정' ? 'active' : ''} ${isLoading && activeOption !== '기간설정' ? 'inactive' : ''}`} 
              onClick={() => {
                if (!isLoading) {
                  setShowDatePicker(true); 
                  setActiveOption('기간설정');
                }
              }}
            >
              {activeOption === '기간설정' ? dateRange : '기간설정'}
            </div>
          </div>
        </div>
      </div>
      {showDatePicker && (
        <div className='modal-overlay' onClick={() => setShowDatePicker(false)}>
          <div className='date-picker-modal' onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '8.5vw',
              left: '71vw',
              width: '28vw',
            }}>
            <div className='date-picker-container'>
              <div className='selectTime-container'>
                <DatePicker
                  locale={ko}
                  selected={tempStartDate}
                  showIcon={true}
                  onChange={(date) => setTempStartDate(date!)}
                  selectsStart
                  startDate={tempStartDate}
                  endDate={tempEndDate}
                  showTimeSelect
                  timeIntervals={1}
                  dateFormat="yyyy.MM.dd HH:mm"
                  maxDate={new Date()}
                  className='custom-datepicker-input'
                />
                <span 
                style={{
                  marginRight: '1vw',
                  color: '#fff'
                }}
                >~</span>
                <DatePicker
                  locale={ko}
                  selected={tempEndDate}
                  showIcon={true}
                  onChange={(date) => setTempEndDate(date!)}
                  selectsEnd
                  startDate={tempStartDate}
                  endDate={tempEndDate}
                  minDate={tempStartDate}
                  minTime={getTimeConstraints(tempEndDate, false).minTime}
                  maxTime={getTimeConstraints(tempEndDate, false).maxTime}
                  showTimeSelect
                  timeIntervals={1}
                  dateFormat="yyyy.MM.dd HH:mm"
                  maxDate={new Date()}
                  className='custom-datepicker-input'
                />
              </div>
              <div className="submit_btn" onClick={() => handleQuickDateSelection('기간설정', tempStartDate, tempEndDate)}>확인</div>
            </div>
          </div>
        </div>
      )}
      
      <div className='detail-bottom-section'>
        <div className='detail-bottom-left-section'>
          <div className='pieChart-section'>
            <div className='pieChart-inner'>
            {isLoading ? (
              <div className="detail-loading">
                <img src={loadingGif} alt="Loading..." className="detail-loading-gif" />
              </div>
            ) : (
            <>
              <div className='pieChart-inner-left'> 
                <DonutChartDetail data={[
                  {
                    id: "pikezone1",
                    data: [
                      { x: "OK", y: chartData.OK },
                      { x: "NG", y: chartData.NG }
                      ]
                    }
                  ]} />
              </div>
            <div className='pieChart-inner-right'>
              <div className='type-section'>
                <div className='type-title'>부품 타입</div>
                <div className='type-text'>{selectedPart}</div>
              </div>
              <div className='total-section'>
              <div className='total-title'>검사 개수</div>
                <div className='total-text'>
                <div className='total-count'>{totalCount.toLocaleString()}</div>
                <div className='ok-percent'>{okPercent}%</div>
                </div>
              </div>
              <div className='ng-section'>
              <div className='ng-title'>불량 개수</div>
                <div className='ng-text'>
                  <div className='ng-count'>{chartData.NG.toLocaleString()}</div>
                  <div className='ng-percent'>{ngPercent}%</div>
                </div>
              </div>
            </div>
            </>
            )}
          </div>
          </div>
        <div className='barChart-section'>
          <div className='barChart-inner'>
          <div className='barChart-top'><img src={gnb3} alt="gnb Icon" className='barChart-icon'></img><span>불량 타입 TOP 10</span></div>
          <div className='barChart-bottom'>
          {isLoading ? (
            <div className="detail-loading">
              <img src={loadingGif} alt="Loading..." className="detail-loading-gif" />
            </div>
          ) : (
          <>
            <div className='barChart-bottom-toggle'>
              <div onClick={() => handleToggle('first-five')} className={`first-five ${activeToggle === 'first-five' ? 'active' : 'inactive'}`}>
                1-5 위
              </div>
              <div onClick={() => handleToggle('six-to-ten')} className={`six-to-ten ${activeToggle === 'six-to-ten' ? 'active' : 'inactive'}`}>
                6-10 위
              </div>
            </div>
      
            <div className='barChart-bottom-graph'>
            <BarChart data={showFirstFive ? topDefects.slice(0, 5) : topDefects.slice(5, 10) } max={maxDefectCount} total={chartData.NG} />
            </div>
            </>
          )}
        </div>
          </div>
        </div> 
        </div>
        <div className='detail-bottom-right-section'>
          <div className='detail-defect-list-inner'>
            <div className='detail-defect-list-inner-top'><img src={gnb3_a} alt="gnb Icon" className='defect-list-icon'></img><span>불량 히스토리</span></div>
            <div className='detail-defect-list-inner-bottom'>
              <div className='column-section'>
                <div className='ng-name'>불량명</div>
                <div className='ng-date'>날짜</div>
              </div>
              <div className='content-section'>
                <div className='inner-detail-content' ref={innerContentRef} style={{overflowY: 'scroll' }}>
                  {isLoading ? (
                    <div className="detail-loading">
                      <img src={loadingGif} alt="Loading..." className="detail-loading-gif" />
                    </div>
                  ) : (
                    displayedItems.map((item, index) => (
                      <DefectItem key={index} item={item} />
                    ))
                  )}
                  {!hasMore && !isLoading && (
                    <div className="end-message">모든 항목이 로드되었습니다.</div>
                )}
                </div>
              </div>
              <FileDownloadComponent 
                clientName={unitNumber || ''} 
                part={selectedPart} 
                startDate={format(startDate, 'yyyyMMdd_HHmm')} 
                endDate={format(endDate, 'yyyyMMdd_HHmm')} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
