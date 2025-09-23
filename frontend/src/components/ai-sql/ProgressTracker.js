import React from 'react';

const ProgressTracker = ({ steps, sourceNeId, targetNeId }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'processing':
        return '⏳';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusText = (step) => {
    switch (step.status) {
      case 'completed':
        return `처리 완료 (${step.count}건)`;
      case 'processing':
        return '처리 중...';
      case 'error':
        return '처리 실패';
      default:
        return '대기 중...';
    }
  };

  const getTableDescription = (tableName) => {
    const descriptions = {
      'tb_cdrsend_base_info': 'CDR 전송 기본 정보',
      'tb_cdrcoll_base_info': 'CDR 수집 기본 정보',
      'tb_cdrcoll_srvr_info': 'CDR 수집 서버 정보',
      'tb_wflow_info': '워크플로우 정보',
      'tb_file_fmt_info': '파일 포맷 정보',
      'ABC Lab API 변환': 'NE ID 자동 변환'
    };
    return descriptions[tableName] || tableName;
  };

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <section className="progress-tracker-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">⚡</span>
          AI SQL 생성 진행 상황
        </h2>
        <div className="migration-info">
          <div className="migration-badge">
            <span className="badge-icon">🔄</span>
            <div className="badge-content">
              <span className="badge-label">변환 작업</span>
              <span className="badge-value">{sourceNeId} → {targetNeId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="progress-container">
        {/* 전체 진행률 */}
        <div className="overall-progress card">
          <div className="overall-progress-header">
            <h3>
              <span className="progress-icon">📊</span>
              전체 진행률
            </h3>
            <div className="progress-stats">
              <span className="progress-percentage">{progressPercent}%</span>
              <span className="progress-fraction">({completedSteps}/{totalSteps})</span>
            </div>
          </div>
          <div className="overall-progress-bar">
            <div 
              className="overall-progress-fill"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="progress-glow"></div>
            </div>
          </div>
        </div>

        {/* 단계별 진행상황 */}
        <div className="steps-container">
          <div className="steps-header">
            <h3>
              <span className="steps-icon">📋</span>
              처리 단계
            </h3>
          </div>
          
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`progress-step ${step.status}`}
              >
                <div className="step-indicator">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-status-icon">
                    {getStatusIcon(step.status)}
                  </div>
                </div>

                <div className="step-content">
                  <div className="step-header">
                    <h4 className="step-title">{step.name}</h4>
                    <div className="step-description">
                      {getTableDescription(step.name)}
                    </div>
                  </div>

                  <div className="step-status">
                    <span className="status-text">
                      {getStatusText(step)}
                    </span>
                    {step.status === 'processing' && (
                      <div className="step-progress">
                        <div className="progress-bar">
                          <div className="progress-fill"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 처리 정보 */}
        <div className="processing-info card">
          <h3>
            <span className="info-icon">💡</span>
            처리 정보
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">예상 소요 시간</span>
              <span className="info-value">1-3분</span>
            </div>
            <div className="info-item">
              <span className="info-label">처리 방식</span>
              <span className="info-value">순차 처리</span>
            </div>
            <div className="info-item">
              <span className="info-label">API 변환</span>
              <span className="info-value">ABC Lab</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .progress-tracker-section {
          max-width: 1000px;
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
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          font-family: var(--font-sans);
          letter-spacing: -0.025em;
        }

        .section-icon {
          font-size: 2.8rem;
          background: linear-gradient(135deg, var(--accent-yellow), var(--accent-orange));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(229, 192, 123, 0.5));
        }

        .migration-info {
          display: flex;
          justify-content: center;
        }

        .migration-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          padding: 12px 20px;
          border-radius: 25px;
          box-shadow: var(--shadow-md);
        }

        .badge-icon {
          font-size: 1.2rem;
        }

        .badge-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .badge-label {
          color: var(--text-secondary);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .badge-value {
          color: var(--accent-blue);
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 1rem;
        }

        .progress-container {
          display: grid;
          gap: 32px;
        }

        .overall-progress {
          background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
          border: 1px solid var(--border-primary);
          position: relative;
          overflow: hidden;
        }

        .overall-progress::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
        }

        .overall-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .overall-progress-header h3 {
          color: var(--text-white);
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-icon {
          font-size: 1.4rem;
        }

        .progress-stats {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .progress-percentage {
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent-blue);
          font-family: var(--font-mono);
        }

        .progress-fraction {
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-family: var(--font-mono);
        }

        .overall-progress-bar {
          width: 100%;
          height: 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-secondary);
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }

        .overall-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
          border-radius: 6px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .progress-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .steps-container {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 24px;
        }

        .steps-header {
          margin-bottom: 24px;
          text-align: center;
        }

        .steps-header h3 {
          color: var(--text-white);
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .steps-icon {
          font-size: 1.4rem;
        }

        .progress-steps {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .progress-step {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid var(--border-primary);
          background: var(--bg-tertiary);
          transition: var(--transition);
          position: relative;
        }

        .progress-step.waiting {
          border-color: var(--border-secondary);
          background: var(--bg-tertiary);
        }

        .progress-step.processing {
          border-color: var(--accent-blue);
          background: linear-gradient(135deg, var(--bg-tertiary), rgba(97, 175, 239, 0.05));
          box-shadow: 0 0 20px rgba(97, 175, 239, 0.2);
          animation: pulse 2s infinite;
        }

        .progress-step.completed {
          border-color: var(--accent-green);
          background: linear-gradient(135deg, var(--bg-tertiary), rgba(152, 195, 121, 0.05));
        }

        .progress-step.error {
          border-color: var(--accent-red);
          background: linear-gradient(135deg, var(--bg-tertiary), rgba(224, 108, 117, 0.05));
        }

        @keyframes pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(97, 175, 239, 0.2);
          }
          50% { 
            box-shadow: 0 0 30px rgba(97, 175, 239, 0.4);
          }
        }

        .step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent-blue);
          color: var(--text-white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: var(--shadow-sm);
        }

        .progress-step.completed .step-number {
          background: var(--accent-green);
        }

        .progress-step.error .step-number {
          background: var(--accent-red);
        }

        .progress-step.processing .step-number {
          animation: rotate 2s linear infinite;
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .step-status-icon {
          font-size: 1.2rem;
        }

        .step-content {
          flex: 1;
          min-width: 0;
        }

        .step-header {
          margin-bottom: 12px;
        }

        .step-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-white);
          margin: 0 0 6px 0;
          font-family: var(--font-mono);
        }

        .step-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .step-status {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-text {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .step-progress {
          width: 100%;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: var(--bg-primary);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent-blue);
          border-radius: 3px;
          animation: progressAnimation 2s infinite;
        }

        @keyframes progressAnimation {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }

        .processing-info {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
        }

        .processing-info h3 {
          color: var(--text-white);
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .info-icon {
          font-size: 1.3rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-secondary);
          border-radius: 6px;
        }

        .info-label {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .info-value {
          color: var(--accent-blue);
          font-weight: 600;
          font-size: 0.9rem;
          font-family: var(--font-mono);
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .progress-tracker-section {
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

          .migration-badge {
            flex-direction: column;
            text-align: center;
            gap: 8px;
          }

          .badge-content {
            align-items: center;
          }

          .overall-progress-header {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }

          .progress-stats {
            justify-content: center;
          }

          .progress-step {
            padding: 16px;
            gap: 16px;
          }

          .step-number {
            width: 35px;
            height: 35px;
            font-size: 0.9rem;
          }

          .info-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .section-header h2 {
            font-size: 1.8rem;
          }

          .section-icon {
            font-size: 2rem;
          }

          .steps-container {
            padding: 16px;
          }

          .progress-step {
            flex-direction: column;
            text-align: center;
            padding: 16px;
            gap: 12px;
          }

          .step-indicator {
            flex-direction: row;
            gap: 12px;
          }

          .step-number {
            width: 32px;
            height: 32px;
            font-size: 0.8rem;
          }

          .progress-percentage {
            font-size: 1.8rem;
          }

          .progress-fraction {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </section>
  );
};

export default ProgressTracker;