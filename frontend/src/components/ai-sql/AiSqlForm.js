import React, { useState } from 'react';

const AiSqlForm = ({ formData, onSubmit, onDataPreview, isLoading }) => {
  const [localFormData, setLocalFormData] = useState({
    sourceNeId: formData.sourceNeId || '',
    targetNeId: formData.targetNeId || ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData(prev => ({
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
    
    if (!localFormData.sourceNeId.trim()) {
      newErrors.sourceNeId = '기준 NE ID를 입력해주세요.';
    }
    
    if (!localFormData.targetNeId.trim()) {
      newErrors.targetNeId = '신규 NE ID를 입력해주세요.';
    }

    if (localFormData.sourceNeId.trim() === localFormData.targetNeId.trim()) {
      newErrors.targetNeId = '기준 NE ID와 신규 NE ID는 서로 달라야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(localFormData.sourceNeId.trim(), localFormData.targetNeId.trim());
    }
  };

  const handlePreview = () => {
    if (!localFormData.sourceNeId.trim()) {
      setErrors({ sourceNeId: '기준 NE ID를 입력해주세요.' });
      return;
    }
    
    onDataPreview(localFormData.sourceNeId.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  };

  return (
    <section className="ai-sql-form-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">🤖</span>
          AI SQL 생성 설정
        </h2>
        <p className="section-subtitle">
          기준 NE ID와 신규 NE ID를 입력하여 자동 SQL을 생성하세요
        </p>
      </div>

      <div className="form-card card">
        <div className="card-header">
          <h3 className="card-title">
            <span className="title-icon">⚙️</span>
            NE ID 설정
          </h3>
          <p className="card-subtitle">변환할 NE ID 정보를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="ai-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="sourceNeId" className="form-label">
                <span className="label-icon">📍</span>
                기준 NE ID
                <span className="label-required">*</span>
              </label>
              <input
                type="text"
                id="sourceNeId"
                name="sourceNeId"
                className={`form-input ${errors.sourceNeId ? 'form-input-error' : ''}`}
                value={localFormData.sourceNeId}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="예: NE001"
                disabled={isLoading}
                autoComplete="off"
              />
              {errors.sourceNeId && <span className="form-error">{errors.sourceNeId}</span>}
              <small className="form-help">기존 데이터를 조회할 NE ID를 입력하세요</small>
            </div>

            <div className="form-group">
              <label htmlFor="targetNeId" className="form-label">
                <span className="label-icon">🎯</span>
                신규 NE ID
                <span className="label-required">*</span>
              </label>
              <input
                type="text"
                id="targetNeId"
                name="targetNeId"
                className={`form-input ${errors.targetNeId ? 'form-input-error' : ''}`}
                value={localFormData.targetNeId}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="예: NE002"
                disabled={isLoading}
                autoComplete="off"
              />
              {errors.targetNeId && <span className="form-error">{errors.targetNeId}</span>}
              <small className="form-help">새로 생성될 데이터의 NE ID를 입력하세요</small>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary preview-btn"
              onClick={handlePreview}
              disabled={isLoading || !localFormData.sourceNeId.trim()}
            >
              <span className="btn-icon">👀</span>
              데이터 미리보기
            </button>
            
            <button
              type="submit"
              className="btn btn-success generate-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  생성 중...
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  AI SQL 생성
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
            AI SQL 생성 안내
          </h4>
        </div>
        
        <div className="help-content">
          <div className="help-category">
            <h5>처리 테이블</h5>
            <div className="table-list">
              <div className="table-item">
                <span className="table-name">tb_cdrsend_base_info</span>
                <span className="table-desc">CDR 전송 기본 정보</span>
              </div>
              <div className="table-item">
                <span className="table-name">tb_cdrcoll_base_info</span>
                <span className="table-desc">CDR 수집 기본 정보</span>
              </div>
              <div className="table-item">
                <span className="table-name">tb_cdrcoll_srvr_info</span>
                <span className="table-desc">CDR 수집 서버 정보</span>
              </div>
              <div className="table-item">
                <span className="table-name">tb_wflow_info</span>
                <span className="table-desc">워크플로우 정보</span>
              </div>
              <div className="table-item">
                <span className="table-name">tb_file_fmt_info</span>
                <span className="table-desc">파일 포맷 정보</span>
              </div>
            </div>
          </div>
          
          <div className="help-category">
            <h5>처리 과정</h5>
            <div className="process-steps">
              <div className="step">
                <span className="step-number">1</span>
                <span className="step-text">기준 NE ID로 5개 테이블에서 관련 데이터 추출</span>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <span className="step-text">ABC Lab API를 통한 NE ID 자동 변환</span>
              </div>
              <div className="step">
                <span class="step-number">3</span>
                <span class="step-text">변환된 INSERT문 생성 및 검증</span>
              </div>
            </div>
          </div>
          
          <div class="help-category">
            <h5>주의사항</h5>
            <ul class="caution-list">
              <li>기준 NE ID에 해당하는 데이터가 존재해야 합니다</li>
              <li>처리 시간은 데이터 양에 따라 1-3분 소요될 수 있습니다</li>
              <li>생성된 SQL은 검증 후 사용하시기 바랍니다</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ai-sql-form-section {
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
          background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(152, 195, 121, 0.5));
        }

        .section-subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin: 0;
          font-weight: 400;
        }

        .form-card {
          margin-bottom: 32px;
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

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 40px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: var(--text-white);
          margin-bottom: 8px;
          font-size: 0.9rem;
        }

        .label-icon {
          font-size: 1rem;
        }

        .label-required {
          color: var(--accent-red);
          font-weight: 700;
          margin-left: 2px;
        }

        .form-help {
          color: var(--text-muted);
          font-size: 0.8rem;
          margin-top: 6px;
          font-style: italic;
          display: block;
        }

        .form-actions {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .preview-btn,
        .generate-btn {
          min-width: 180px;
          padding: 16px 28px;
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 8px;
        }

        .btn-icon {
          font-size: 1.1rem;
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

        .help-category {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 20px;
        }

        .help-category h5 {
          color: var(--accent-blue);
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 16px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-list {
          display: grid;
          gap: 12px;
        }

        .table-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-secondary);
          border-radius: 6px;
          transition: var(--transition);
        }

        .table-item:hover {
          border-color: var(--accent-blue);
          transform: translateX(4px);
        }

        .table-name {
          font-family: var(--font-mono);
          color: var(--accent-yellow);
          font-weight: 500;
          font-size: 0.85rem;
        }

        .table-desc {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        .process-steps {
          display: grid;
          gap: 16px;
        }

        .step {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 12px;
          background: var(--bg-primary);
          border-left: 3px solid var(--accent-green);
          border-radius: 6px;
        }

        .step-number {
          background: var(--accent-green);
          color: var(--text-white);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .step-text {
          color: var(--text-primary);
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .caution-list {
          margin: 0;
          padding-left: 20px;
          list-style-type: none;
        }

        .caution-list li {
          color: var(--text-secondary);
          margin-bottom: 8px;
          line-height: 1.4;
          font-size: 0.85rem;
          position: relative;
        }

        .caution-list li::before {
          content: '⚠️';
          position: absolute;
          left: -20px;
          top: 0;
          font-size: 0.9rem;
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .ai-sql-form-section {
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

          .form-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .form-actions {
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }

          .preview-btn,
          .generate-btn {
            width: 100%;
            max-width: 280px;
          }

          .help-content {
            gap: 24px;
          }

          .table-item {
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

          .help-category {
            padding: 16px;
          }

          .step {
            gap: 12px;
          }

          .step-number {
            width: 20px;
            height: 20px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </section>
  );
};

export default AiSqlForm;