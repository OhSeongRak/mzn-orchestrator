import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Components
import Header from './components/common/Header';
import LoadingSpinner from './components/common/LoadingSpinner';
import DatabaseConnection from './components/database/DatabaseConnection';
import ServiceSelection from './components/common/ServiceSelection';
import CustomSqlGenerator from './components/custom-sql/CustomSqlGenerator';
import AiSqlGenerator from './components/ai-sql/AiSqlGenerator';
import TaskManagement from './components/task/TaskManagement';  // ← NEW!

// Services
import apiService from './services/api';

function App() {
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      await apiService.healthCheck();
      console.log('서버 연결 확인됨');
    } catch (error) {
      console.error('서버 연결 실패:', error);
    }
  };

  const handleDatabaseConnect = async (connectionData) => {
    setIsLoading(true);
    try {
      const result = await apiService.database.connect(connectionData);
      
      if (result.success) {
        setIsDbConnected(true);
        setConnectionInfo(result.data.connection_info);
        navigate('/services');
      }
    } catch (error) {
      console.error('DB 연결 실패:', error);
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
          {/* 데이터베이스 연결 */}
          <Route 
            path="/" 
            element={
              <DatabaseConnection 
                onConnect={handleDatabaseConnect}
                isLoading={isLoading}
              />
            } 
          />
          
          {/* 서비스 선택 */}
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
          
          {/* 커스텀 SQL */}
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
          
          {/* AI SQL */}
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

          {/* 과제 관리 ⭐NEW */}
          <Route 
            path="/tasks" 
            element={<TaskManagement />} 
          />
        </Routes>
      </main>

      {isLoading && <LoadingSpinner />}
    </div>
  );
}

export default App;