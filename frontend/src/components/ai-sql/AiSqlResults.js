import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import RecommendationTab from './RecommendationTab';

const AiSqlResults = ({ results, sourceNeId, targetNeId, onBackToForm }) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommend, setIsLoadingRecommend] = useState(false);

  const handleCopyToClipboard = async (content, itemName) => {
    try {
      const sqlCount = content.split('INSERT INTO').length - 1;
      
      if (sqlCount >= 100) {
        const confirm = window.confirm(
          `SQL문이 ${sqlCount}개입니다.\n용량이 큰 데이터는 파일로 저장하는 것을 권장합니다.\n\n그래도 복사하시겠습니까?`
        );
        if (!confirm) return;
      }

      await navigator.clipboard.writeText(content);
      toast.success(`${itemName}이 클립보드에 복사되었습니다!`);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        toast.success(`${itemName}이 클립보드에 복사되었습니다!`);
      } catch (fallbackError) {
        toast.error('클립보드 복사에 실패했습니다.');
      }
      
      document.body.removeChild(textArea);
    }
  };

  const handleDownloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/sql; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    toast.success('파일이 다운로드되었습니다!');
  };

  const getFullSql = () => {
    let fullSQL = `-- ===============================================\n`;
    fullSQL += `-- AI SQL 생성 결과\n`;
    fullSQL += `-- 기준 NE ID: ${sourceNeId}\n`;
    fullSQL += `-- 신규 NE ID: ${targetNeId}\n`;
    fullSQL += `-- 생성일시: ${new Date().toLocaleString('ko-KR')}\n`;
    fullSQL += `-- 총 INSERT문: ${results.final_insert_count}개\n`;
    fullSQL += `-- ===============================================\n\n`;

    if (results.final_results?.ai_generated_sql) {
      fullSQL += results.final_results.ai_generated_sql.statements.join('\n');
    } else if (results.final_results?.original_sql) {
      fullSQL += results.final_results.original_sql.statements.join('\n');
    }

    return fullSQL;
  };

  const getFileName = () => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const sourceId = sourceNeId.replace(/[^a-zA-Z0-9]/g, '_');
    const targetId = targetNeId.replace(/[^a-zA-Z0-9]/g, '_');
    return `ai_sql_${sourceId}_to_${targetId}_${timestamp}.sql`;
  };

  const fetchRecommendations = async () => {
    setIsLoadingRecommend(true);
    try {
      const response = await axios.post('/api/v1/tasks/recommend', {
        sql: getFullSql()
      });
      
      if (response.data.success) {
        setRecommendations(response.data.data.recommendations);
        if (response.data.data.recommendations.length === 0) {
          toast.info('유사한 과제를 찾지 못했습니다.');
        }
      }
    } catch (error) {
      console.error('추천 조회 오류:', error);
      toast.error('추천 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingRecommend(false);
    }
  };

  const tabs = [
    { id: 'overview', label: '생성 결과', icon: '📊' },
    { id: 'original', label: '원본 데이터', icon: '📋' },
    { id: 'final', label: '최종 SQL', icon: '🎯' },
    { id: 'recommend', label: '유사 과제 추천', icon: '🤖' }
  ];

  return (
    <section className="ai-sql-results-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">🎉</span>
          AI SQL 생성 완료!
        </h2>
        <div className="migration-summary">
          <div className="summary-badge success">
            <span className="badge-icon">✅</span>
            <span className="badge-text">{sourceNeId} → {targetNeId}</span>
          </div>
          <div className="summary-badge info">
            <span className="badge-icon">📄</span>
            <span className="badge-text">총 {results.final_insert_count}개 INSERT문</span>
          </div>
        </div>
      </div>

      <div className="results-container">
        {/* 액션 버튼들 */}
        <div className="result-actions">
          <button
            className="btn btn-success action-btn"
            onClick={() => handleCopyToClipboard(getFullSql(), '전체 SQL')}
          >
            <span className="btn-icon">📋</span>
            전체 SQL 복사
          </button>
          <button
            className="btn btn-secondary action-btn"
            onClick={() => handleDownloadFile(getFullSql(), getFileName())}
          >
            <span className="btn-icon">💾</span>
            SQL 파일 다운로드
          </button>
          <button
            className="btn btn-info action-btn"
            onClick={onBackToForm}
          >
            <span className="btn-icon">🔄</span>
            다시 생성하기
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="tabs-container">
          <div className="tabs-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${selectedTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTab(tab.id);
                  if (tab.id === 'recommend' && recommendations.length === 0) {
                    fetchRecommendations();
                  }
                }}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="tabs-content">
            {selectedTab === 'overview' && (
              <div className="overview-tab">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                      <div className="stat-number">{results.original_table_count}</div>
                      <div className="stat-label">처리된 테이블</div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                      <div className="stat-number">{results.original_insert_count}</div>
                      <div className="stat-label">원본 INSERT문</div>
                    </div>
                  </div>
                  
                  <div className="stat-card success">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                      <div className="stat-number">{results.final_insert_count}</div>
                      <div className="stat-label">최종 INSERT문</div>
                    </div>
                  </div>
                </div>

                <div className="conversion-info card">
                  <h4>
                    <span className="conversion-icon">🤖</span>
                    변환 정보
                  </h4>
                  <div className="conversion-details">
                    {results.final_results?.ai_generated_sql ? (
                      <div className="conversion-success">
                        <div className="conversion-header">
                          <span className="conversion-status-icon">✅</span>
                          <div>
                            <strong>ABC Lab API 변환 성공</strong>
                            <p>AI가 NE ID를 자동으로 변환하여 최적화된 INSERT문을 생성했습니다.</p>
                          </div>
                        </div>
                        <div className="conversion-stats">
                          <div className="conversion-stat">
                            <span className="stat-key">변환 방식:</span>
                            <span className="stat-value">AI 자동 변환</span>
                          </div>
                          <div className="conversion-stat">
                            <span className="stat-key">처리 상태:</span>
                            <span className="stat-value success">완료</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="conversion-fallback">
                        <div className="conversion-header">
                          <span className="conversion-status-icon">⚠️</span>
                          <div>
                            <strong>원본 INSERT문 사용</strong>
                            <p>AI 변환에 실패하여 원본 INSERT문을 제공합니다. 수동으로 NE ID를 확인해주세요.</p>
                          </div>
                        </div>
                        <div className="conversion-stats">
                          <div className="conversion-stat">
                            <span className="stat-key">변환 방식:</span>
                            <span className="stat-value">원본 사용</span>
                          </div>
                          <div className="conversion-stat">
                            <span className="stat-key">처리 상태:</span>
                            <span className="stat-value warning">수동 확인 필요</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'original' && (
              <div className="original-tab">
                <div className="original-header">
                  <h4>
                    <span className="original-icon">📋</span>
                    테이블별 원본 데이터
                  </h4>
                  <p className="original-subtitle">기준 NE ID로 조회된 원본 데이터입니다</p>
                </div>
                
                <div className="tables-list">
                  {Object.entries(results.table_results || {}).map(([tableName, tableData]) => (
                    <div key={tableName} className="table-card">
                      <div className="table-header">
                        <div className="table-title">
                          <span className="table-icon">🗃️</span>
                          <h5>{tableName}</h5>
                        </div>
                        <div className="table-stats">
                          <span className="table-count">{tableData.count}건</span>
                          {tableData.count > 0 && (
                            <span className="table-status success">데이터 있음</span>
                          )}
                        </div>
                      </div>
                      
                      {tableData.count > 0 && (
                        <div className="table-preview">
                          <div className="preview-header">
                            <span className="preview-label">SQL 미리보기</span>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleCopyToClipboard(
                                tableData.statements.join('\n'), 
                                `${tableName} SQL`
                              )}
                            >
                              <span className="btn-icon">📋</span>
                              복사
                            </button>
                          </div>
                          <pre className="sql-preview">
                            {tableData.statements.slice(0, 3).join('\n')}
                            {tableData.statements.length > 3 && '\n...'}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'final' && (
              <div className="final-tab">
                <div className="final-sql-container">
                  <div className="final-sql-header">
                    <div className="final-title">
                      <span className="final-icon">🎯</span>
                      <h4>최종 생성된 INSERT문</h4>
                    </div>
                    <div className="final-actions">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleCopyToClipboard(getFullSql(), '최종 SQL')}
                      >
                        <span className="btn-icon">📋</span>
                        복사
                      </button>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleDownloadFile(getFullSql(), getFileName())}
                      >
                        <span className="btn-icon">💾</span>
                        다운로드
                      </button>
                    </div>
                  </div>
                  
                  <div className="final-sql-content">
                    <pre className="final-sql-code">
                      <code>{getFullSql()}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'recommend' && (
              <RecommendationTab 
                recommendations={recommendations}
                isLoading={isLoadingRecommend}
              />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* 기존 스타일 유지... */
        .ai-sql-results-section {
          animation: fadeInUp 0.6s ease-out;
          padding: 40px 0;
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
          background: linear-gradient(135deg, var(--accent-green), var(--accent-yellow));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(152, 195, 121, 0.5));
        }

        .migration-summary {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .summary-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 25px;
          font-weight: 600;
          color: var(--text-white);
          box-shadow: var(--shadow-md);
        }

        .summary-badge.success {
          background: var(--accent-green);
        }

        .summary-badge.info {
          background: var(--accent-blue);
        }

        .badge-icon {
          font-size: 1.1rem;
        }

        .badge-text {
          font-family: var(--font-mono);
        }

        .results-container {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .result-actions {
          display: flex;
          gap: 16px;
          padding: 24px;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-primary);
          flex-wrap: wrap;
          justify-content: center;
        }

        .action-btn {
          min-width: 160px;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 8px;
        }

        .btn-icon {
          font-size: 1rem;
        }

        .tabs-container {
          background: var(--bg-secondary);
        }

        .tabs-nav {
          display: flex;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-primary);
        }

        .tab-btn {
          flex: 1;
          padding: 16px 20px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
        }

        .tab-btn:hover {
          background: var(--bg-highlight);
          color: var(--text-primary);
        }

        .tab-btn.active {
          color: var(--accent-blue);
          font-weight: 600;
          background: var(--bg-secondary);
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--accent-blue);
        }

        .tab-icon {
          font-size: 1.1rem;
        }

        .tab-label {
          font-size: 0.9rem;
        }

        .tabs-content {
          min-height: 500px;
          padding: 32px;
        }

        /* Overview Tab */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--accent-blue);
        }

        .stat-card.success::before {
          background: var(--accent-green);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--accent-blue);
        }

        .stat-card.success:hover {
          border-color: var(--accent-green);
        }

        .stat-icon {
          font-size: 2.5rem;
          margin-bottom: 16px;
          display: block;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-white);
          margin-bottom: 8px;
          font-family: var(--font-mono);
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .conversion-info {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
        }

        .conversion-info h4 {
          margin: 0 0 20px 0;
          color: var(--text-white);
          font-size: 1.3rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .conversion-icon {
          font-size: 1.4rem;
        }

        .conversion-details {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .conversion-success,
        .conversion-fallback {
          background: var(--bg-secondary);
          border: 1px solid var(--border-secondary);
          border-radius: 8px;
          padding: 20px;
        }

        .conversion-success {
          border-left: 4px solid var(--accent-green);
        }

        .conversion-fallback {
          border-left: 4px solid var(--accent-yellow);
        }

        .conversion-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .conversion-status-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .conversion-header strong {
          color: var(--text-white);
          font-size: 1.1rem;
          display: block;
          margin-bottom: 6px;
        }

        .conversion-header p {
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
          font-size: 0.9rem;
        }

        .conversion-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .conversion-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-secondary);
          border-radius: 6px;
        }

        .stat-key {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .stat-value {
          font-weight: 600;
          font-size: 0.9rem;
          font-family: var(--font-mono);
        }

        .stat-value.success {
          color: var(--accent-green);
        }

        .stat-value.warning {
          color: var(--accent-yellow);
        }

        /* Original Tab */
        .original-tab {
          padding: 0;
        }

        .original-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .original-header h4 {
          color: var(--text-white);
          font-size: 1.4rem;
          font-weight: 600;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .original-icon {
          font-size: 1.5rem;
        }

        .original-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0;
        }

        .tables-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .table-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          overflow: hidden;
        }

        .table-header {
          background: var(--bg-secondary);
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .table-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .table-icon {
          font-size: 1.2rem;
        }

        .table-title h5 {
          margin: 0;
          color: var(--text-white);
          font-family: var(--font-mono);
          font-size: 1rem;
          font-weight: 600;
        }

        .table-stats {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .table-count {
          background: var(--accent-blue);
          color: var(--text-white);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          font-family: var(--font-mono);
        }

        .table-status {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-status.success {
          background: rgba(152, 195, 121, 0.2);
          color: var(--accent-green);
          border: 1px solid rgba(152, 195, 121, 0.3);
        }

        .table-preview {
          padding: 20px;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .preview-label {
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sql-preview {
          background: var(--bg-primary);
          border: 1px solid var(--border-secondary);
          border-radius: 6px;
          padding: 16px;
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 1.4;
          color: var(--text-primary);
          overflow-x: auto;
          white-space: pre;
          margin: 0;
        }

        /* Final Tab */
        .final-tab {
          padding: 0;
        }

        .final-sql-container {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          overflow: hidden;
        }

        .final-sql-header {
          background: var(--bg-primary);
          color: var(--text-white);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-primary);
        }

        .final-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .final-icon {
          font-size: 1.4rem;
        }

        .final-title h4 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .final-actions {
          display: flex;
          gap: 12px;
        }

        .final-sql-content {
          max-height: 600px;
          overflow: auto;
          background: var(--bg-primary);
        }

        .final-sql-code {
          color: var(--text-primary);
          padding: 20px;
          margin: 0;
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .final-sql-code code {
          color: inherit;
          font-family: inherit;
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .section-header h2 {
            font-size: 2rem;
            flex-direction: column;
            gap: 12px;
          }

          .section-icon {
            font-size: 2.2rem;
          }

          .migration-summary {
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .result-actions {
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .action-btn {
            width: 100%;
            max-width: 280px;
          }

          .tabs-nav {
            flex-direction: column;
          }

          .tabs-content {
            padding: 20px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .conversion-stats {
            grid-template-columns: 1fr;
          }

          .table-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .final-sql-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .final-actions {
            width: 100%;
            justify-content: space-between;
          }

          .final-actions .btn {
            flex: 1;
          }
        }

        @media (max-width: 480px) {
          .section-header h2 {
            font-size: 1.8rem;
          }

          .section-icon {
            font-size: 2rem;
          }

          .summary-badge {
            padding: 10px 16px;
            font-size: 0.9rem;
          }

          .tabs-content {
            padding: 16px;
          }

          .stat-card {
            padding: 20px;
          }

          .stat-number {
            font-size: 2rem;
          }

          .conversion-info {
            padding: 16px;
          }

          .table-preview {
            padding: 16px;
          }

          .sql-preview {
            padding: 12px;
            font-size: 11px;
          }

          .final-sql-header {
            padding: 12px 16px;
          }

          .final-sql-code {
            padding: 16px;
            font-size: 11px;
          }
        }
      `}</style>
    </section>
  );
};

export default AiSqlResults;