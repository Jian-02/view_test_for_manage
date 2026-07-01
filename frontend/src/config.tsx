const APIEndPoint = `${process.env.REACT_APP_API_BASE_URL}`;
const WSEndPoint = `${process.env.REACT_APP_API_BASE_URL?.replace("http", "ws")}/ws`;
const ALERTEndPoint = `${process.env.REACT_APP_API_BASE_URL?.replace("http", "ws")}/alert`;

export { APIEndPoint, WSEndPoint, ALERTEndPoint};