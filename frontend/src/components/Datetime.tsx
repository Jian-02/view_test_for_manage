import React, { useState, useEffect } from 'react';
import ResponsiveAnimatedNumber from './Numberanimation';

const DateTimeDisplay: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState<any>('');

  useEffect(() => {
    const formatDate = (date: Date) => {
      const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dayName = days[date.getDay()];
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return (<>
        {year}.{month}.{day} {dayName} {}
        {(Number(hours) < 10 ? "0" : "")}
        <ResponsiveAnimatedNumber value={Number(hours)} fhdsize={18} duration={700}/>
        :
        {(Number(minutes) < 10 ? "0" : "")}
        <ResponsiveAnimatedNumber value={Number(minutes)} fhdsize={18} duration={700}/>
        {/* :
        {(Number(seconds) < 10 ? "0" : "")}
        <ResponsiveAnimatedNumber value={Number(seconds)} fhdsize={18} duration={700}/> */}
      </>

      );
    };

    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(formatDate(now));
    };

    updateDateTime(); 
    const intervalId = setInterval(updateDateTime, 1000); 

    return () => clearInterval(intervalId); 
  }, []);

  return <div className="datetime">{currentDateTime}</div>;
};

export default DateTimeDisplay;