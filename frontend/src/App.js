import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Components
import Header from './components/common/Header';
import LoadingSpinner from './components/common/LoadingSpinner';
import DatabaseConnection from './components/database/DatabaseConnection';
import ServiceSelection from './components/common/ServiceSelection';
import CustomSqlGenerator from './components/custom-sql/CustomSqlGenerator';
import AiSqlGenerator from './components/ai-sql/AiSqlGenerator';

// Services
import apiService from './services/api';

function App() {
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 앱 시작 시 서버 연결 확인
  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      await apiService.healthCheck();
      console.log('서버 연결 확인됨');
    } catch (error) {
      toast.error('서버에 연결할 수 없습니다. 백엔드 서버를 확인해주세요.');
    }
  };

  const handleDatabaseConnect = async (connectionData) => {
    setIsLoading(true);
    try {
      const result = await apiService.database.connect(connectionData);
      
      if (result.success) {
        setIsDbConnected(true);
        setConnectionInfo(result.data.connection_info);
        toast.success('데이터베이스 연결이 성공했습니다!');
        navigate('/services');
      }
    } catch (error) {
      toast.error(error.message || '데이터베이스 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToConnection = () => {
    setIsDbConnected(false);
    setConnectionInfo('');
    navigate('/');
  };

  const handleServiceSelect = (service) => {
    navigate(`/${service}`);
  };

  return (
    <div className="App">
      <Header 
        isDbConnected={isDbConnected}
        connectionInfo={connectionInfo}
        onBackToConnection={handleBackToConnection}
      />
      
      <main className="container">
        <Routes>
          {/* 데이터베이스 연결 페이지 */}
          <Route 
            path="/" 
            element={
              <DatabaseConnection 
                onConnect={handleDatabaseConnect}
                isLoading={isLoading}
              />
            } 
          />
          
          {/* 서비스 선택 페이지 */}
          <Route 
            path="/services" 
            element={
              isDbConnected ? (
                <ServiceSelection 
                  onServiceSelect={handleServiceSelect}
                  connectionInfo={connectionInfo}
                />
              ) : (
                <DatabaseConnection 
                  onConnect={handleDatabaseConnect}
                  isLoading={isLoading}
                />
              )
            } 
          />
          
          {/* 커스텀 SQL 생성 페이지 */}
          <Route 
            path="/custom-sql" 
            element={
              isDbConnected ? (
                <CustomSqlGenerator />
              ) : (
                <DatabaseConnection 
                  onConnect={handleDatabaseConnect}
                  isLoading={isLoading}
                />
              )
            } 
          />
          
          {/* AI SQL 생성 페이지 */}
          <Route 
            path="/ai-sql" 
            element={
              isDbConnected ? (
                <AiSqlGenerator />
              ) : (
                <DatabaseConnection 
                  onConnect={handleDatabaseConnect}
                  isLoading={isLoading}
                />
              )
            } 
          />
        </Routes>
      </main>

      {isLoading && <LoadingSpinner />}
    </div>
  );
}

export default App;