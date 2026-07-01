import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './Popup.css';
import { useNavigate } from 'react-router-dom';
import {useGlobalContext } from '../components/Context';


interface ModalPageProps {
  isModalOpen: boolean;
  closeModal: () => void;
  divs: JSX.Element[];
}

const ModalPage: React.FC<ModalPageProps> = ({ isModalOpen, closeModal, divs }) => {
  const navigate = useNavigate();
  const { count, setCount } = useGlobalContext();

  const handleMoreClick = () => {
    navigate('/Alert'); 
    closeModal()
  };
  const displayDivs = divs.slice(0, 4);
  const displayDivs2 = displayDivs.map((item, index) => (
    <div
      key={item.props.Datetime + '-' + item.props.ClientName}
      className={item.props.className} 
      onClick={() => handleClick(index)}
    >
      <div className='pc-detail'>
        {item.props.className === 'alert-content' && <div className='red-dot'></div>}
        <div className='pc-name'>{item.props.children[0].props.children}</div>
        <div className='pc-text'>에서</div> 
        <div className='pc-name'>{item.props.children[1].props.children}</div>
        <div className='pc-text'>이(가) 발생했습니다.</div>
      </div>
      <div className="pc-datetime">{item.props.children[2].props.children}</div>
      {/* <div>{item.props.children[0].props.children}</div>
      <div>{item.props.children[1].props.children}</div>
      <div>{item.props.children[2].props.children}</div> */}
    </div>
  ));
  
  const handleClick = (index: number) => {
    const updatedDivs = divs.map((div, i) =>
      i === index && div.props.children.className !== 'alert-content-close'  // Already clicked div remains unchanged
        ? React.cloneElement(div, { className: 'alert-content-close' })  // Change className on first click
        : div
    );

    const alertDataToStore = updatedDivs.map((div) => {
      const clientName = div.props?.children[0]?.props?.children || "Unknown";
      const text = div.props?.children[1]?.props?.children || "";
      const datetime = div.props?.children[2]?.props?.children || "";
      
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
    const clientName = updatedDivs[index]?.props?.children[0]?.props?.children || "Unknown";
    navigate(`/contact/${clientName}`);
    closeModal();
    return updatedDivs; 
  };


  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={closeModal}
      contentLabel="Example Modal"
      className="modal-content" 
      style={{
        overlay:{        
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }
      }}
    >
      <div className='popup-title'>경고 알림</div>
      <div className='popup-content'>
        {displayDivs2}
      </div>
      <button onClick={handleMoreClick} className='popup-button'>더보기</button>
    </Modal>
  );
};

export default ModalPage;
