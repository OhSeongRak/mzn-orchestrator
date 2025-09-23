import React, { useState } from 'react';

const DatabaseConnection = ({ onConnect, isLoading }) => {
  const [formData, setFormData] = useState({
    host: '10.217.59.149',
    port: '5444',
    name: 'devkmzn',
    user: 'kmznmst',
    pass: 'new1234!'
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 에러 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.host.trim()) {
      newErrors.host = '호스트를 입력해주세요.';
    }
    
    if (!formData.port.trim()) {
      newErrors.port = '포트를 입력해주세요.';
    } else if (isNaN(formData.port) || formData.port < 1 || formData.port > 65535) {
      newErrors.port = '올바른 포트 번호를 입력해주세요. (1-65535)';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = '데이터베이스명을 입력해주세요.';
    }
    
    if (!formData.user.trim()) {
      newErrors.user = '사용자명을 입력해주세요.';
    }
    
    if (!formData.pass.trim()) {
      newErrors.pass = '비밀번호를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onConnect(formData);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  };

  return (
    <section className="db-connection-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">🔗</span>
          데이터베이스 연결
        </h2>
        <p>먼저 데이터베이스에 연결해주세요</p>
      </div>

      <div className="connection-card card">
        <form onSubmit={handleSubmit} className="connection-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="host" className="form-label">호스트</label>
              <input
                type="text"
                id="host"
                name="host"
                className={`form-input ${errors.host ? 'form-input-error' : ''}`}
                value={formData.host}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="예: localhost"
                disabled={isLoading}
              />
              {errors.host && <span className="form-error">{errors.host}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="port" className="form-label">포트</label>
              <input
                type="number"
                id="port"
                name="port"
                className={`form-input ${errors.port ? 'form-input-error' : ''}`}
                value={formData.port}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="예: 5432"
                min="1"
                max="65535"
                disabled={isLoading}
              />
              {errors.port && <span className="form-error">{errors.port}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">데이터베이스명</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                value={formData.name}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="데이터베이스 이름"
                disabled={isLoading}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="user" className="form-label">사용자명</label>
              <input
                type="text"
                id="user"
                name="user"
                className={`form-input ${errors.user ? 'form-input-error' : ''}`}
                value={formData.user}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="사용자 이름"
                disabled={isLoading}
              />
              {errors.user && <span className="form-error">{errors.user}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="pass" className="form-label">비밀번호</label>
              <input
                type="password"
                id="pass"
                name="pass"
                className={`form-input ${errors.pass ? 'form-input-error' : ''}`}
                value={formData.pass}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="비밀번호"
                disabled={isLoading}
              />
              {errors.pass && <span className="form-error">{errors.pass}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary connect-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  연결 중...
                </>
              ) : (
                <>
                  <span className="btn-icon">🔗</span>
                  접속하기
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .db-connection-section {
          max-width: 600px;
          margin: 0 auto;
          animation: fadeInUp 0.5s ease-out;
        }

        .section-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .section-header h2 {
          color: var(--gray-dark);
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .section-icon {
          font-size: 2rem;
        }

        .section-header p {
          color: #666;
          font-size: 1rem;
          margin: 0;
        }

        .connection-card {
          margin-bottom: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-weight: 600;
          color: var(--gray-dark);
          margin-bottom: 8px;
          font-size: 0.95rem;
        }

        .form-input {
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          font-size: 14px;
          transition: var(--transition);
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--sky-dark);
          box-shadow: 0 0 0 3px rgba(70, 130, 180, 0.1);
          transform: translateY(-1px);
        }

        .form-input:disabled {
          background: #f8f9fa;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .form-input-error {
          border-color: var(--error);
        }

        .form-input-error:focus {
          border-color: var(--error);
          box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
        }

        .form-error {
          color: var(--error);
          font-size: 0.8rem;
          margin-top: 4px;
          font-weight: 500;
        }

        .form-actions {
          display: flex;
          justify-content: center;
        }

        .connect-btn {
          min-width: 180px;
          padding: 15px 30px;
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-icon {
          font-size: 1.1rem;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .db-connection-section {
            max-width: 100%;
          }

          .section-header h2 {
            font-size: 1.6rem;
            flex-direction: column;
            gap: 5px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .connect-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .section-header h2 {
            font-size: 1.4rem;
          }

          .form-input {
            padding: 10px 14px;
            font-size: 13px;
          }

          .connect-btn {
            padding: 12px 20px;
            font-size: 0.95rem;
          }
        }
      `}</style>
    </section>
  );
};

export default DatabaseConnection;