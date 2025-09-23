import React from 'react';

const ColumnOptions = ({ 
  tableInfo, 
  columnOptions, 
  whereClause, 
  onColumnOptionsChange, 
  onWhereClauseChange, 
  onGenerateSql, 
  isLoading 
}) => {

  const handleOptionChange = (columnName, optionType, value) => {
    onColumnOptionsChange(prev => ({
      ...prev,
      [`${columnName}_${optionType}`]: value
    }));
  };

  const renderColumnInputs = (column) => {
    const optionKey = `${column.column_name}_option`;
    const selectedOption = columnOptions[optionKey] || 'default';

    switch (selectedOption) {
      case 'user_input':
        return (
          <input
            type="text"
            className="form-input column-input"
            placeholder="사용자 정의 값"
            value={columnOptions[`${column.column_name}_value`] || ''}
            onChange={(e) => handleOptionChange(column.column_name, 'value', e.target.value)}
            disabled={isLoading}
          />
        );

      case 'replace':
        return (
          <div className="replace-inputs">
            <input
              type="text"
              className="form-input column-input"
              placeholder="기존 값"
              value={columnOptions[`${column.column_name}_value1`] || ''}
              onChange={(e) => handleOptionChange(column.column_name, 'value1', e.target.value)}
              disabled={isLoading}
            />
            <input
              type="text"
              className="form-input column-input"
              placeholder="변경할 값"
              value={columnOptions[`${column.column_name}_value2`] || ''}
              onChange={(e) => handleOptionChange(column.column_name, 'value2', e.target.value)}
              disabled={isLoading}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="column-options-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">⚙️</span>
          커스텀 옵션 설정
        </h2>
        <p className="section-subtitle">
          테이블: <span className="table-info">{tableInfo.schema}.{tableInfo.tableName}</span>
        </p>
      </div>

      <div className="options-container">
        {/* WHERE 조건 설정 */}
        <div className="where-section card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="title-icon">🔍</span>
              WHERE 조건 설정
            </h3>
            <p className="card-subtitle">SQL 쿼리에 적용할 WHERE 조건을 입력하세요</p>
          </div>
          
          <div className="where-input-container">
            <textarea
              className="form-textarea where-textarea"
              value={whereClause}
              onChange={(e) => onWhereClauseChange(e.target.value)}
              placeholder="예: WHERE id > 100 AND status = 'active'"
              rows="4"
              disabled={isLoading}
            />
            <div className="where-help">
              <span className="help-icon">💡</span>
              WHERE 키워드는 자동으로 추가되므로 조건문만 입력하세요
            </div>
          </div>
        </div>

        {/* SQL 생성 섹션 */}
        <div className="generation-section card">
          <div className="generation-content">
            <div className="generation-info">
              <h3 className="generation-title">
                <span className="generation-icon">🚀</span>
                SQL 생성 준비 완료
              </h3>
              <p className="generation-desc">
                {tableInfo.columns.length}개 컬럼에 대한 설정이 완료되었습니다
              </p>
            </div>
            
            <button
              className="btn btn-success generate-btn"
              onClick={onGenerateSql}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  SQL 생성 중...
                </>
              ) : (
                <>
                  <span className="btn-icon">⚡</span>
                  커스텀 SQL 생성
                </>
              )}
            </button>
          </div>
        </div>

        {/* 컬럼 설정 */}
        <div className="columns-section">
          <div className="columns-header">
            <h3>
              <span className="columns-icon">📋</span>
              컬럼별 옵션 설정
            </h3>
            <p className="columns-subtitle">
              각 컬럼에 대한 처리 방식을 선택하고 필요한 값을 입력하세요
            </p>
          </div>
          
          <div className="columns-grid">
            {tableInfo.columns.map((column, index) => (
              <div key={column.column_name} className="column-item card">
                <div className="column-header">
                  <div className="column-info">
                    <div className="column-name-container">
                      <span className="column-name">{column.column_name}</span>
                      <span className="column-index">#{index + 1}</span>
                    </div>
                    <span className="column-type">{column.udt_name}</span>
                  </div>
                </div>

                <div className="column-body">
                  <div className="column-option">
                    <label className="option-label">
                      <span className="label-icon">🎯</span>
                      처리 방식
                    </label>
                    <select
                      className="form-select"
                      value={columnOptions[`${column.column_name}_option`] || 'default'}
                      onChange={(e) => handleOptionChange(column.column_name, 'option', e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="default">원본 값</option>
                      <option value="replace">특정 단어 교체</option>
                      <option value="now">현재 시각</option>
                      <option value="user_input">사용자 정의 값</option>
                    </select>
                  </div>

                  <div className="column-inputs">
                    {renderColumnInputs(column)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .column-options-section {
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
          background: linear-gradient(135deg, var(--accent-orange), var(--accent-yellow));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(209, 154, 102, 0.5));
        }

        .section-subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin: 0;
        }

        .table-info {
          color: var(--accent-blue);
          font-weight: 600;
          font-family: var(--font-mono);
          background: var(--bg-tertiary);
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid var(--border-primary);
        }

        .options-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* WHERE 섹션 */
        .where-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
        }

        .where-input-container {
          position: relative;
        }

        .where-textarea {
          width: 100%;
          min-height: 120px;
          background: var(--bg-input);
          border: 1px solid var(--border-primary);
          color: var(--text-primary);
          font-family: var(--font-mono);
          resize: vertical;
        }

        .where-textarea:focus {
          background: var(--bg-tertiary);
          border-color: var(--border-highlight);
        }

        .where-help {
          margin-top: 12px;
          color: var(--text-secondary);
          font-style: italic;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .help-icon {
          font-size: 1rem;
        }

        /* 생성 섹션 */
        .generation-section {
          background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
          border: 1px solid var(--border-primary);
          position: relative;
          overflow: hidden;
        }

        .generation-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, var(--accent-green), var(--accent-blue));
        }

        .generation-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .generation-info {
          flex: 1;
        }

        .generation-title {
          color: var(--text-white);
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .generation-icon {
          font-size: 1.4rem;
        }

        .generation-desc {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0;
        }

        .generate-btn {
          min-width: 200px;
          padding: 16px 32px;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-icon {
          font-size: 1.2rem;
        }

        /* 컬럼 섹션 */
        .columns-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 24px;
        }

        .columns-header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-primary);
        }

        .columns-header h3 {
          color: var(--text-white);
          font-size: 1.4rem;
          font-weight: 600;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .columns-icon {
          font-size: 1.5rem;
        }

        .columns-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0;
        }

        .columns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        .column-item {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }

        .column-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: var(--accent-blue);
          transform: scaleY(0);
          transition: transform 0.3s ease;
        }

        .column-item:hover {
          border-color: var(--accent-blue);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .column-item:hover::before {
          transform: scaleY(1);
        }

        .column-header {
          padding: 16px 20px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-primary);
        }

        .column-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .column-name-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .column-name {
          font-family: var(--font-mono);
          color: var(--text-white);
          font-weight: 600;
          font-size: 1rem;
        }

        .column-index {
          background: var(--accent-blue);
          color: var(--text-white);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .column-type {
          background: var(--bg-primary);
          color: var(--accent-yellow);
          font-size: 0.8rem;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid var(--border-secondary);
          font-family: var(--font-mono);
          align-self: flex-start;
        }

        .column-body {
          padding: 20px;
        }

        .column-option {
          margin-bottom: 16px;
        }

        .option-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: var(--text-white);
          font-size: 0.9rem;
          margin-bottom: 8px;
        }

        .label-icon {
          font-size: 1rem;
        }

        .column-inputs {
          min-height: 40px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .column-input {
          padding: 10px 12px;
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          font-size: 13px;
          transition: var(--transition);
          background: var(--bg-input);
          color: var(--text-primary);
          font-family: var(--font-mono);
        }

        .column-input:focus {
          outline: none;
          border-color: var(--border-highlight);
          background: var(--bg-secondary);
          box-shadow: 0 0 0 2px rgba(97, 175, 239, 0.2);
        }

        .column-input::placeholder {
          color: var(--text-muted);
          font-style: italic;
        }

        .replace-inputs {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .replace-inputs .column-input:first-child {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          border-bottom: none;
        }

        .replace-inputs .column-input:last-child {
          border-top-left-radius: 0;
          border-top-right-radius: 0;
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

          .section-subtitle {
            font-size: 1rem;
          }

          .columns-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .generation-content {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }

          .generate-btn {
            width: 100%;
          }

          .where-textarea {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .section-header h2 {
            font-size: 1.8rem;
          }

          .section-icon {
            font-size: 2rem;
          }

          .columns-section {
            padding: 16px;
          }

          .column-header {
            padding: 12px 16px;
          }

          .column-body {
            padding: 16px;
          }

          .column-name {
            font-size: 0.9rem;
          }

          .column-index {
            width: 20px;
            height: 20px;
            font-size: 0.7rem;
          }

          .column-type {
            font-size: 0.75rem;
            padding: 2px 6px;
          }

          .generate-btn {
            padding: 14px 24px;
            font-size: 1rem;
          }

          .replace-inputs {
            gap: 6px;
          }
        }
      `}</style>
    </section>
  );
};

export default ColumnOptions;