import React, { useState } from 'react';

const TableSelector = ({ schema, tableName, onTableSelect, isLoading }) => {
  const [formData, setFormData] = useState({
    schema: schema || 'kmznmst',
    tableName: tableName || 'tb_cdrsend_base_info'
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
    
    if (!formData.schema.trim()) {
      newErrors.schema = '스키마를 입력해주세요.';
    }
    
    if (!formData.tableName.trim()) {
      newErrors.tableName = '테이블명을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onTableSelect(formData.schema.trim(), formData.tableName.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  };

  return (
    <section className="table-selector-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">📋</span>
          테이블 선택
        </h2>
        <p className="section-subtitle">
          커스텀 SQL을 생성할 테이블을 선택하세요
        </p>
      </div>

      <div className="selector-card card">
        <div className="card-header">
          <h3 className="card-title">
            <span className="title-icon">🗃️</span>
            데이터베이스 테이블 정보
          </h3>
          <p className="card-subtitle">조회할 테이블의 스키마와 이름을 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="selector-form">
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label htmlFor="schema" className="form-label">
                <span className="label-icon">🏗️</span>
                스키마
                <span className="label-required">*</span>
              </label>
              <input
                type="text"
                id="schema"
                name="schema"
                className={`form-input ${errors.schema ? 'form-input-error' : ''}`}
                value={formData.schema}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="스키마 이름"
                disabled={isLoading}
                autoComplete="off"
              />
              {errors.schema && <span className="form-error">{errors.schema}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="tableName" className="form-label">
                <span className="label-icon">📊</span>
                테이블명
                <span className="label-required">*</span>
              </label>
              <input
                type="text"
                id="tableName"
                name="tableName"
                className={`form-input ${errors.tableName ? 'form-input-error' : ''}`}
                value={formData.tableName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="테이블 이름"
                disabled={isLoading}
                autoComplete="off"
              />
              {errors.tableName && <span className="form-error">{errors.tableName}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary fetch-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  조회 중...
                </>
              ) : (
                <>
                  <span className="btn-icon">🔍</span>
                  테이블 조회
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 도움말 섹션 */}
      <div className="help-section card">
        <div className="help-header">
          <h4>
            <span className="help-icon">💡</span>
            사용 안내
          </h4>
        </div>
        
        <div className="help-content">
          <div className="help-grid">
            <div className="help-item">
              <div className="help-item-header">
                <span className="help-item-icon">🏗️</span>
                <h5>스키마</h5>
              </div>
              <p>테이블이 속한 스키마명을 입력하세요</p>
              <div className="code-example">
                <code>kmznmst</code>
              </div>
            </div>
            
            <div className="help-item">
              <div className="help-item-header">
                <span className="help-item-icon">📊</span>
                <h5>테이블명</h5>
              </div>
              <p>조회할 테이블명을 정확히 입력하세요</p>
              <div className="code-example">
                <code>tb_cdrsend_base_info</code>
              </div>
            </div>
            
            <div className="help-item">
              <div className="help-item-header">
                <span className="help-item-icon">⚠️</span>
                <h5>주의사항</h5>
              </div>
              <ul className="caution-list">
                <li>PostgreSQL의 경우 소문자로 입력해주세요</li>
                <li>스키마와 테이블명을 정확히 입력해야 합니다</li>
                <li>테이블 접근 권한이 있는지 확인하세요</li>
              </ul>
            </div>
          </div>
          
          <div className="common-tables">
            <h5>
              <span className="tables-icon">📑</span>
              자주 사용되는 테이블
            </h5>
            <div className="tables-grid">
              <button 
                type="button" 
                className="table-suggestion"
                onClick={() => setFormData({schema: 'kmznmst', tableName: 'tb_cdrsend_base_info'})}
                disabled={isLoading}
              >
                <span className="table-name">tb_cdrsend_base_info</span>
                <span className="table-desc">CDR 전송 기본 정보</span>
              </button>
              <button 
                type="button" 
                className="table-suggestion"
                onClick={() => setFormData({schema: 'kmznmst', tableName: 'tb_cdrcoll_base_info'})}
                disabled={isLoading}
              >
                <span className="table-name">tb_cdrcoll_base_info</span>
                <span className="table-desc">CDR 수집 기본 정보</span>
              </button>
              <button 
                type="button" 
                className="table-suggestion"
                onClick={() => setFormData({schema: 'kmznmst', tableName: 'tb_wflow_info'})}
                disabled={isLoading}
              >
                <span className="table-name">tb_wflow_info</span>
                <span className="table-desc">워크플로우 정보</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .table-selector-section {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 0;
          animation: fadeInUp 0.6s ease-out;
        }

        .section-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .section-header h2 {
          color: var(--text-white);
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          font-family: var(--font-sans);
          letter-spacing: -0.025em;
        }

        .section-icon {
          font-size: 2.8rem;
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(97, 175, 239, 0.5));
        }

        .section-subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin: 0;
          font-weight: 400;
        }

        .selector-card {
          margin-bottom: 32px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
        }

        .card-header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-primary);
        }

        .card-title {
          color: var(--text-white);
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .title-icon {
          font-size: 1.5rem;
        }

        .card-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0;
        }

        .form-actions {
          display: flex;
          justify-content: center;
          margin-top: 32px;
        }

        .fetch-btn {
          min-width: 200px;
          padding: 16px 32px;
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-icon {
          font-size: 1.1rem;
        }

        .label-required {
          color: var(--accent-red);
          font-weight: 700;
          margin-left: 2px;
        }

        .help-section {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
        }

        .help-header {
          margin-bottom: 24px;
          text-align: center;
        }

        .help-header h4 {
          color: var(--text-white);
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .help-icon {
          font-size: 1.4rem;
        }

        .help-content {
          display: grid;
          gap: 32px;
        }

        .help-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .help-item {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 20px;
          transition: var(--transition);
        }

        .help-item:hover {
          border-color: var(--accent-blue);
          transform: translateY(-2px);
        }

        .help-item-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .help-item-icon {
          font-size: 1.2rem;
        }

        .help-item h5 {
          color: var(--accent-blue);
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .help-item p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .code-example {
          background: var(--bg-primary);
          border: 1px solid var(--border-secondary);
          border-radius: 6px;
          padding: 8px 12px;
        }

        .code-example code {
          color: var(--accent-yellow);
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .caution-list {
          margin: 0;
          padding-left: 20px;
          list-style-type: none;
        }

        .caution-list li {
          color: var(--text-secondary);
          margin-bottom: 6px;
          line-height: 1.4;
          font-size: 0.85rem;
          position: relative;
        }

        .caution-list li::before {
          content: '•';
          color: var(--accent-orange);
          position: absolute;
          left: -16px;
          top: 0;
          font-weight: 700;
        }

        .common-tables {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 20px;
        }

        .common-tables h5 {
          color: var(--text-white);
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tables-icon {
          font-size: 1.1rem;
        }

        .tables-grid {
          display: grid;
          gap: 12px;
        }

        .table-suggestion {
          background: var(--bg-primary);
          border: 1px solid var(--border-secondary);
          border-radius: 6px;
          padding: 12px 16px;
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .table-suggestion:hover:not(:disabled) {
          border-color: var(--accent-blue);
          background: var(--bg-highlight);
          transform: translateX(4px);
        }

        .table-suggestion:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .table-name {
          font-family: var(--font-mono);
          color: var(--accent-green);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .table-desc {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .table-selector-section {
            max-width: 100%;
            padding: 24px 0;
          }

          .section-header h2 {
            font-size: 2rem;
            flex-direction: column;
            gap: 12px;
          }

          .section-icon {
            font-size: 2.2rem;
          }

          .section-subtitle {
            font-size: 1rem;
          }

          .form-grid-2 {
            grid-template-columns: 1fr;
          }

          .fetch-btn {
            width: 100%;
          }

          .help-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .table-suggestion {
            flex-direction: column;
            gap: 4px;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .section-header h2 {
            font-size: 1.8rem;
          }

          .section-icon {
            font-size: 2rem;
          }

          .card-title {
            font-size: 1.2rem;
            flex-direction: column;
            gap: 8px;
          }

          .help-item {
            padding: 16px;
          }

          .common-tables {
            padding: 16px;
          }
        }
      `}</style>
    </section>
  );
};

export default TableSelector;