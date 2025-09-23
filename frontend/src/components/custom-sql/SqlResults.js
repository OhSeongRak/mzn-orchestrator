import React, { useState } from 'react';
import toast from 'react-hot-toast';

const SqlResults = ({ results, tableInfo, onValidate, isLoading }) => {
  const [selectedTab, setSelectedTab] = useState('results');

  const handleCopyToClipboard = async (content, itemName) => {
    try {
      if (results.rows.length >= 100) {
        const confirm = window.confirm(
          `SQL문이 ${results.rows.length}개입니다.\n용량이 큰 데이터는 파일로 저장하는 것을 권장합니다.\n\n그래도 복사하시겠습니까?`
        );
        if (!confirm) return;
      }

      await navigator.clipboard.writeText(content);
      toast.success(`${itemName}이 클립보드에 복사되었습니다!`);
    } catch (error) {
      // Fallback for older browsers
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

  const getSqlStatements = () => {
    return results.rows.map(row => row[0]).join('\n');
  };

  const getFileName = () => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
    return `${tableInfo.tableName}_insert_${timestamp}.sql`;
  };

  const tabs = [
    { id: 'results', label: '생성 결과', icon: '📊' },
    { id: 'template', label: 'SQL 템플릿', icon: '📝' }
  ];

  return (
    <section className="sql-results-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">📄</span>
          커스텀 SQL 생성 결과
        </h2>
        <div className="result-summary">
          <div className="summary-badge success">
            <span className="badge-icon">✅</span>
            <span className="badge-text">총 {results.record_count}건</span>
          </div>
          <div className="summary-badge info">
            <span className="badge-icon">🗃️</span>
            <span className="badge-text">{tableInfo.schema}.{tableInfo.tableName}</span>
          </div>
        </div>
      </div>

      <div className="results-container">
        {/* 액션 버튼들 */}
        <div className="result-actions">
          <button
            className="btn btn-secondary action-btn"
            onClick={() => handleCopyToClipboard(getSqlStatements(), 'INSERT문')}
          >
            <span className="btn-icon">📋</span>
            SQL 복사
          </button>
          <button
            className="btn btn-secondary action-btn"
            onClick={() => handleDownloadFile(getSqlStatements(), getFileName())}
          >
            <span className="btn-icon">💾</span>
            파일 저장
          </button>
          <button
            className="btn btn-info action-btn"
            onClick={onValidate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                검증 중...
              </>
            ) : (
              <>
                <span className="btn-icon">🔍</span>
                AI SQL 검증
              </>
            )}
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="tabs-container">
          <div className="tabs-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${selectedTab === tab.id ? 'active' : ''}`}
                onClick={() => setSelectedTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="tabs-content">
            {selectedTab === 'results' && (
              <div className="results-tab">
                <div className="results-stats">
                  <div className="stat-item">
                    <span className="stat-value">{results.record_count}</span>
                    <span className="stat-label">생성된 INSERT문</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{results.columns.length}</span>
                    <span className="stat-label">처리된 컬럼</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{tableInfo.tableName}</span>
                    <span className="stat-label">대상 테이블</span>
                  </div>
                </div>

                <div className="table-container">
                  <div className="table-header">
                    <h4>
                      <span className="table-icon">📋</span>
                      생성된 SQL 미리보기
                    </h4>
                    <span className="table-info">
                      {results.rows.length > 50 ? '처음 50건만 표시' : `전체 ${results.rows.length}건 표시`}
                    </span>
                  </div>
                  
                  <div className="table-scroll">
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th className="row-number-header">No.</th>
                          {results.columns.map((column, index) => (
                            <th key={index} className="column-header">{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.rows.slice(0, 50).map((row, index) => (
                          <tr key={index} className="table-row">
                            <td className="row-number">{index + 1}</td>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="sql-cell">
                                <div className="cell-content">
                                  {cell || ''}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {results.rows.length > 50 && (
                    <div className="table-footer">
                      <div className="footer-content">
                        <span className="footer-icon">📝</span>
                        <span className="footer-text">
                          처음 50건만 표시됩니다. 전체 데이터는 복사 또는 다운로드를 이용하세요.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTab === 'template' && (
              <div className="template-tab">
                <div className="template-container">
                  <div className="template-header">
                    <div className="template-title">
                      <span className="template-icon">🛠️</span>
                      <h4>INSERT문 생성 SQL</h4>
                    </div>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleCopyToClipboard(results.sql_template, 'SQL 템플릿')}
                    >
                      <span className="btn-icon">📋</span>
                      복사
                    </button>
                  </div>
                  <div className="template-content">
                    <pre className="sql-template">
                      <code>{results.sql_template}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .sql-results-section {
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
          background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(152, 195, 121, 0.5));
        }

        .result-summary {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .summary-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: var(--shadow-sm);
        }

        .summary-badge.success {
          background: var(--accent-green);
          color: var(--text-white);
        }

        .summary-badge.info {
          background: var(--accent-blue);
          color: var(--text-white);
        }

        .badge-icon {
          font-size: 1rem;
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
          min-width: 140px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
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
          min-height: 400px;
        }

        .results-tab {
          padding: 24px;
        }

        .results-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-item {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          transition: var(--transition);
        }

        .stat-item:hover {
          border-color: var(--accent-blue);
          transform: translateY(-2px);
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent-blue);
          margin-bottom: 8px;
          font-family: var(--font-mono);
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-container {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .table-header {
          background: var(--bg-tertiary);
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .table-header h4 {
          color: var(--text-white);
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .table-icon {
          font-size: 1.2rem;
        }

        .table-info {
          color: var(--text-secondary);
          font-size: 0.8rem;
          background: var(--bg-primary);
          padding: 4px 8px;
          border-radius: 12px;
          border: 1px solid var(--border-secondary);
        }

        .table-scroll {
          max-height: 500px;
          overflow: auto;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          background: var(--bg-secondary);
        }

        .results-table th {
          background: var(--bg-primary);
          color: var(--text-white);
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          position: sticky;
          top: 0;
          z-index: 10;
          font-size: 12px;
          border-bottom: 1px solid var(--border-primary);
        }

        .row-number-header {
          width: 60px;
          text-align: center;
        }

        .column-header {
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .results-table td {
          padding: 8px;
          border-bottom: 1px solid var(--border-secondary);
          vertical-align: top;
          word-break: break-word;
          max-width: 300px;
        }

        .table-row:hover {
          background: var(--bg-highlight);
        }

        .row-number {
          background: var(--bg-tertiary);
          font-weight: 600;
          color: var(--text-secondary);
          text-align: center;
          width: 60px;
          position: sticky;
          left: 0;
          z-index: 5;
        }

        .sql-cell {
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 1.4;
          color: var(--text-primary);
        }

        .cell-content {
          overflow: visible;
          text-overflow: unset;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .table-footer {
          background: var(--bg-tertiary);
          padding: 16px 20px;
          border-top: 1px solid var(--border-primary);
          text-align: center;
        }

        .footer-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .footer-icon {
          font-size: 1rem;
        }

        .footer-text {
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-style: italic;
        }

        .template-tab {
          padding: 0;
        }

        .template-container {
          border-radius: 0;
          overflow: hidden;
        }

        .template-header {
          background: var(--bg-primary);
          color: var(--text-white);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-primary);
        }

        .template-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .template-icon {
          font-size: 1.3rem;
        }

        .template-title h4 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .template-content {
          max-height: 500px;
          overflow: auto;
        }

        .sql-template {
          background: var(--bg-primary);
          color: var(--text-primary);
          padding: 20px;
          margin: 0;
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 1.5;
          overflow-x: auto;
          white-space: pre-wrap;
        }

        .sql-template code {
          color: var(--text-primary);
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

          .result-summary {
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
            max-width: 250px;
          }

          .tabs-nav {
            flex-direction: column;
          }

          .results-stats {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .table-scroll {
            max-height: 300px;
          }

          .results-table th,
          .results-table td {
            padding: 6px 4px;
            font-size: 11px;
          }

          .template-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .template-header .btn {
            align-self: flex-end;
          }
        }

        @media (max-width: 480px) {
          .section-header h2 {
            font-size: 1.8rem;
          }

          .section-icon {
            font-size: 2rem;
          }

          .results-tab {
            padding: 16px;
          }

          .stat-value {
            font-size: 1.8rem;
          }

          .template-header {
            padding: 12px 16px;
          }

          .sql-template {
            padding: 16px;
            font-size: 11px;
          }

          .cell-content {
            max-width: 150px;
          }
        }
      `}</style>
    </section>
  );
};

export default SqlResults;