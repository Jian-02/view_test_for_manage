import React, { useEffect, useState } from 'react';
import {WSEndPoint, ALERTEndPoint} from '../config';

interface WebSocketProps {
    onData: (data: Record<string, any>) => void;
  }
  
const WebSocketComponent: React.FC<WebSocketProps> = ({ onData }) =>  {
    // const [message, setMessage] = useState<Record<string, any>>({}); // Initialize message as an empty object
  
    useEffect(() => {
      const socketData = new WebSocket(WSEndPoint); // Ensure 'ws' protocol is used for WebSocket
  
      socketData.onopen = () => {
        console.log('WebSocket connected');
      };
      socketData.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data); // Parse the message as JSON
            onData(data); // Update state with the parsed data
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
  
      socketData.onclose = () => {
        console.log('WebSocket closed');
      };
  
      return () => {
        socketData.close();
      };
    }, []);
  
    return null;
  };

interface AlertSocketProps {
  onData: (newDiv: Array<Record<string, any>>) => void; // Callback to send new data to parent
}

const AlertSocketComponent: React.FC<AlertSocketProps> = ({ onData }) => {
  useEffect(() => {
    const socketAlert = new WebSocket(ALERTEndPoint);
    socketAlert.onopen = () => {
      console.log('AlertSocket connected');
    };

    socketAlert.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Create a new div element with WebSocket data
        // const newDiv = (
        //     <div className='alert-content'>
        //       <div className="name">{data["ClientName"]}</div>
        //       <div className="detail">{data["Text"]}</div>
        //       <div className="datetime">{data["Datetime"]}</div>
        //     </div>
        // );
        onData(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socketAlert.onclose = () => {
      console.log('AlertSocket closed');
    };

    return () => {
      socketAlert.close();
    };
  }, []);

  return null; // This component doesn't render anything visually
};

export { WebSocketComponent };
export { AlertSocketComponent };