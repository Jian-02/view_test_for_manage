import React from 'react';
import axios from 'axios';
import printIcon from '../images/print.svg'; // 아이콘 경로
import {APIEndPoint} from '../config'

interface FileDownloadProps {
  clientName: string;
  part: string;
  startDate: string;
  endDate: string;
}

const FileDownloadComponent: React.FC<FileDownloadProps> = ({ clientName, part, startDate, endDate }) => {
  const handleDownload = async () => {
    const confirmed = window.confirm("파일을 다운로드하시겠습니까?");
    if (confirmed) {
      try {
        const response = await axios.post(
          `${APIEndPoint}/detail/api/update_data/${clientName}/${part}/${startDate}/${endDate}?download_excel=true`,
          {},
          { responseType: 'blob' } 
        );
  

        const url = window.URL.createObjectURL(new Blob([response.data]));
  

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${clientName}_${part}_${startDate}_${endDate}.xlsx`); 
        document.body.appendChild(link);
        link.click();
  

        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading the file:', error);
      }
      console.log("다운로드 시작");

    } else {
      console.log("다운로드 취소");
    }
   
  };

  return (
    <div className='print-section'>
      <div className='print-btn' onClick={handleDownload}>
        <img src={printIcon} alt="print Icon" className='print-icon' />
        프린트하기
      </div>
    </div>
  );
};

export default FileDownloadComponent;