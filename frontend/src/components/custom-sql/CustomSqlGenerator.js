import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import TableSelector from './TableSelector';
import ColumnOptions from './ColumnOptions';
import SqlResults from './SqlResults';

const CustomSqlGenerator = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // 테이블 정보
  const [tableInfo, setTableInfo] = useState({
    schema: 'kmznmst',
    tableName: 'tb_cdrsend_base_info',
    columns: []
  });
  
  // 컬럼 옵션
  const [columnOptions, setColumnOptions] = useState({});
  const [whereClause, setWhereClause] = useState("WHERE wflow_inst_id LIKE '%HBDACM00'");
  
  // SQL 결과
  const [sqlResults, setSqlResults] = useState(null);

  // 단계별 완료 상태
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    { id: 1, title: '테이블 선택', icon: '📋' },
    { id: 2, title: '컬럼 옵션 설정', icon: '⚙️' },
    { id: 3, title: 'SQL 생성 결과', icon: '📄' }
  ];

  const handleTableSelect = async (schema, tableName) => {
    setIsLoading(true);
    try {
      const result = await apiService.database.getTableColumns(schema, tableName);
      
      if (result.success) {
        setTableInfo({
          schema: result.data.schema,
          tableName: result.data.table_name,
          columns: result.data.columns
        });
        
        // 컬럼 옵션 초기화
        const initialOptions = {};
        result.data.columns.forEach(column => {
          initialOptions[`${column.column_name}_option`] = 'default';
        });
        setColumnOptions(initialOptions);
        
        setCompletedSteps([1]);
        setCurrentStep(2);
        toast.success(`테이블 '${result.data.table_name}'의 컬럼을 성공적으로 조회했습니다.`);
      }
    } catch (error) {
      toast.error(error.message || '테이블 조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSql = async () => {
    setIsLoading(true);
    try {
      const formData = {
        schema: tableInfo.schema,
        table_name: tableInfo.tableName,
        where_clause: whereClause,
        ...columnOptions
      };

      const result = await apiService.customSql.generate(formData);
      
      if (result.success) {
        setSqlResults(result.data);
        setCompletedSteps([1, 2]);
        setCurrentStep(3);
        toast.success(`커스텀 SQL이 성공적으로 생성되었습니다! (${result.data.record_count}건)`);
      }
    } catch (error) {
      toast.error(error.message || 'SQL 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateSql = async () => {
    if (!sqlResults?.rows) {
      toast.error('검증할 SQL 데이터가 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const validationData = {
        table_data: sqlResults.rows,
        schema: tableInfo.schema,
        table_name: tableInfo.tableName
      };

      const result = await apiService.customSql.validate(validationData);
      
      if (result.success) {
        toast.success('SQL 검증이 완료되었습니다.');
        // 검증 결과를 모달로 표시할 수 있음
        alert(`검증 결과:\n${result.data.verification_result}`);
      }
    } catch (error) {
      toast.error(error.message || 'SQL 검증에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepClick = (stepId) => {
    if (stepId === 1) {
      setCurrentStep(1);
    } else if (stepId === 2 && completedSteps.includes(1)) {
      setCurrentStep(2);
    } else if (stepId === 3 && completedSteps.includes(2)) {
      setCurrentStep(3);
    }
  };

  const handleBackToServices = () => {
    navigate('/services');
  };

  return (
    <div className="custom-sql-generator">
      {/* 진행 단계 표시 */}
      <div className="progress-container">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`progress-step ${
              currentStep === step.id ? 'active' : 
              completedSteps.includes(step.id) ? 'completed' : 
              'disabled'
            }`}
            onClick={() => handleStepClick(step.id)}
          >
            <div className="step-number">
              {completedSteps.includes(step.id) ? '✓' : step.id}
            </div>
            <div className="step-info">
              <div className="step-icon">{step.icon}</div>
              <div className="step-text">{step.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 단계별 컨텐츠 */}
      <div className="step-content">
        {currentStep === 1 && (
          <TableSelector
            schema={tableInfo.schema}
            tableName={tableInfo.tableName}
            onTableSelect={handleTableSelect}
            isLoading={isLoading}
          />
        )}

        {currentStep === 2 && (
          <ColumnOptions
            tableInfo={tableInfo}
            columnOptions={columnOptions}
            whereClause={whereClause}
            onColumnOptionsChange={setColumnOptions}
            onWhereClauseChange={setWhereClause}
            onGenerateSql={handleGenerateSql}
            isLoading={isLoading}
          />
        )}

        {currentStep === 3 && sqlResults && (
          <SqlResults
            results={sqlResults}
            tableInfo={tableInfo}
            onValidate={handleValidateSql}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* 뒤로가기 버튼 */}
      <div className="back-section">
        <button
          className="btn btn-secondary"
          onClick={handleBackToServices}
        >
          <span className="btn-icon">⬅️</span>
          서비스 선택으로 돌아가기
        </button>
      </div>

      <style jsx>{`
        .custom-sql-generator {
          animation: fadeInUp 0.5s ease-out;
        }

        .progress-container {
          display: flex;
          justify-content: center;
          margin-bottom: 40px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0 20px;
          position: relative;
          transition: var(--transition);
          cursor: pointer;
          padding: 10px;
          border-radius: 12px;
          min-width: 120px;
        }

        .progress-step:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 25px;
          left: 100%;
          width: 40px;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
          z-index: 1;
        }

        .progress-step.completed::after,
        .progress-step.active::after {
          background: var(--success);
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 8px;
          transition: var(--transition);
          z-index: 2;
          position: relative;
          font-size: 0.9rem;
        }

        .progress-step.active .step-number {
          background: var(--sky-primary);
          color: white;
          transform: scale(1.1);
          box-shadow: var(--shadow-md);
        }

        .progress-step.completed .step-number {
          background: var(--success);
          color: white;
          transform: scale(1.05);
        }

        .step-info {
          text-align: center;
        }

        .step-icon {
          font-size: 1.2rem;
          margin-bottom: 4px;
        }

        .step-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.8rem;
          font-weight: 500;
          line-height: 1.2;
        }

        .progress-step.active .step-text {
          color: white;
          font-weight: 600;
        }

        .progress-step.completed .step-text {
          color: white;
          font-weight: 600;
        }

        .progress-step:hover:not(.disabled) {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .progress-step.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .step-content {
          margin-bottom: 40px;
        }

        .back-section {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-icon {
          margin-right: 8px;
          font-size: 0.9rem;
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .progress-container {
            flex-wrap: wrap;
            gap: 10px;
            padding: 15px;
          }

          .progress-step {
            margin: 5px;
            min-width: 100px;
          }

          .progress-step:not(:last-child)::after {
            display: none;
          }

          .step-number {
            width: 35px;
            height: 35px;
            font-size: 0.8rem;
          }

          .step-icon {
            font-size: 1rem;
          }

          .step-text {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .progress-step {
            min-width: 80px;
          }

          .step-number {
            width: 30px;
            height: 30px;
            font-size: 0.75rem;
          }

          .step-icon {
            font-size: 0.9rem;
          }

          .step-text {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomSqlGenerator;