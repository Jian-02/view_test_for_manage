import React, { createContext, useContext, useState } from "react";

// Context 타입 정의
interface GlobalContextType {
  count: number;
  setCount: (value: number) => void;
}

// Context 생성
const GlobalContext = createContext<GlobalContextType | null>(null);

// Provider 컴포넌트
export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [count, setCount] = useState<number>(() => {
    const storedCount = localStorage.getItem("count");
    return storedCount ? JSON.parse(storedCount) : 0;
  });

  return (
    <GlobalContext.Provider value={{ count, setCount }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Hook으로 사용
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
