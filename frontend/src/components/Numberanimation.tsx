import React, { useState, useEffect } from 'react';
import AnimatedNumber from 'react-awesome-animated-number';
import "react-awesome-animated-number/dist/index.css";

interface ResponsiveAnimatedNumberProps {
    value: number; // value를 number 타입으로 지정
    fhdsize: number;
    duration: number;
  }
  
  const ResponsiveAnimatedNumber: React.FC<ResponsiveAnimatedNumberProps> = ({ value, fhdsize, duration }) => {
    const [size, setSize] = useState(20);

  useEffect(() => {
    const updateSize = () => {
        setSize(fhdsize*(window.innerWidth/1920))
    };
    setSize(fhdsize*(window.innerWidth/1920))
    updateSize(); // Initial check
    window.addEventListener('resize', updateSize); // Update on resize

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <AnimatedNumber value={value} hasComma={true} size={size} duration={duration} className="custom-animated-number"/>
  );
};

export default ResponsiveAnimatedNumber;