import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import AiSqlForm from './AiSqlForm';
import ProgressTracker from './ProgressTracker';
import AiSqlResults from './AiSqlResults';

const AiSqlGenerator = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState('form'); // 'form', 'processing', 'results'
  const [isLoading, setIsLoading] = useState(false);
  
  // AI SQL 생성 데이터
  const [formData, setFormData] = useState({
    sourceNeId: '',
    targetNeId: ''
  });
  
  // 결과 데이터
  const [aiSqlResults, setAiSqlResults] = useState(null);
  
  // 진행 상태
  const [processSteps, setProcessSteps] = useState([
    { id: 1, name: 'tb_cdrsend_base_info', status: 'waiting', count: 0 },
    { id: 2, name: 'tb_cdrcoll_base_info', status: 'waiting', count: 0 },
    { id: 3, name: 'tb_cdrcoll_srvr_info', status: 'waiting', count: 0 },
    { id: 4, name: 'tb_wflow_info', status: 'waiting', count: 0 },
    { id: 5, name: 'tb_file_fmt_info', status: 'waiting', count: 0 },
    { id: 'api', name: 'ABC Lab API 변환', status: 'waiting', count: 0 }
  ]);

  const handleFormSubmit = async (sourceNeId, targetNeId) => {
    if (sourceNeId === targetNeId) {
      toast.error('기준 NE ID와 신규 NE ID는 서로 달라야 합니다.');
      return;
    }

    setFormData({ sourceNeId, targetNeId });
    setCurrentStep('processing');
    setIsLoading(true);

    // 진행 상태 초기화
    setProcessSteps(steps => 
      steps.map(step => ({ ...step, status: 'waiting', count: 0 }))
    );

    try {
      // 진행 상태 시뮬레이션 (실제로는 백엔드에서 실시간으로 받아야 함)
      simulateProgress();

      const result = await apiService.aiSql.generate({
        source_ne_id: sourceNeId,
        target_ne_id: targetNeId
      });

      if (result.success) {
        setAiSqlResults(result.data);
        setCurrentStep('results');
        
        // 모든 단계를 완료로 표시
        setProcessSteps(steps => 
          steps.map(step => ({ ...step, status: 'completed' }))
        );

        toast.success(
          `AI SQL 생성이 완료되었습니다! (총 ${result.data.final_insert_count}개 INSERT문)`
        );
      }
    } catch (error) {
      // 에러 시 모든 단계를 실패로 표시
      setProcessSteps(steps => 
        steps.map(step => ({ ...step, status: 'error' }))
      );
      
      toast.error(error.message || 'AI SQL 생성에 실패했습니다.');
      setCurrentStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateProgress = () => {
    const stepIds = [1, 2, 3, 4, 5, 'api'];
    let currentIndex = 0;

    const updateStep = () => {
      if (currentIndex < stepIds.length) {
        const stepId = stepIds[currentIndex];
        
        setProcessSteps(steps => 
          steps.map(step => 
            step.id === stepId 
              ? { ...step, status: 'processing' }
              : step
          )
        );

        setTimeout(() => {
          setProcessSteps(steps => 
            steps.map(step => 
              step.id === stepId 
                ? { ...step, status: 'completed', count: Math.floor(Math.random() * 50) + 1 }
                : step
            )
          );
          
          currentIndex++;
          if (currentIndex < stepIds.length) {
            setTimeout(updateStep, 500);
          }
        }, 1000 + Math.random() * 1000);
      }
    };

    setTimeout(updateStep, 1000);
  };

  const handleDataPreview = async (sourceNeId) => {
    try {
      const result = await apiService.aiSql.getDataPreview(sourceNeId);
      
      if (result.success) {
        const preview = result.data;
        const message = `데이터 미리보기 결과:\n\n` +
          `총 ${preview.total_records}건의 데이터 발견\n` +
          `데이터가 있는 테이블: ${preview.tables_with_data}개\n\n` +
          Object.entries(preview.table_stats)
            .map(([table, stats]) => `• ${table}: ${stats.count}건`)
            .join('\n');
        
        alert(message);
      }
    } catch (error) {
      toast.error('데이터 미리보기에 실패했습니다.');
    }
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setAiSqlResults(null);
    setFormData({ sourceNeId: '', targetNeId: '' });
  };

  const handleBackToServices = () => {
    navigate('/services');
  };

  return (
    <div className="ai-sql-generator">
      <div className="generator-header">
        <h1>
          <span className="header-icon">🔄</span>
          AI SQL 생성 도구
        </h1>
        <p>NE ID 기반 자동 SQL 생성 및 변환</p>
      </div>

      {currentStep === 'form' && (
        <AiSqlForm
          formData={formData}
          onSubmit={handleFormSubmit}
          onDataPreview={handleDataPreview}
          isLoading={isLoading}
        />
      )}

      {currentStep === 'processing' && (
        <ProgressTracker
          steps={processSteps}
          sourceNeId={formData.sourceNeId}
          targetNeId={formData.targetNeId}
        />
      )}

      {currentStep === 'results' && aiSqlResults && (
        <AiSqlResults
          results={aiSqlResults}
          sourceNeId={formData.sourceNeId}
          targetNeId={formData.targetNeId}
          onBackToForm={handleBackToForm}
        />
      )}

      {/* 뒤로가기 버튼 */}
      <div className="back-section">
        {currentStep === 'results' ? (
          <div className="back-buttons">
            <button
              className="btn btn-secondary"
              onClick={handleBackToForm}
            >
              <span className="btn-icon">🔄</span>
              다시 생성하기
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleBackToServices}
            >
              <span className="btn-icon">⬅️</span>
              서비스 선택으로 돌아가기
            </button>
          </div>
        ) : (
          <button
            className="btn btn-secondary"
            onClick={handleBackToServices}
            disabled={isLoading}
          >
            <span className="btn-icon">⬅️</span>
            서비스 선택으로 돌아가기
          </button>
        )}
      </div>

      <style jsx>{`
        .ai-sql-generator {
          animation: fadeInUp 0.5s ease-out;
        }

        .generator-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .generator-header h1 {
          color: var(--gray-dark);
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .header-icon {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #4CAF50, #45a049);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .generator-header p {
          color: #666;
          font-size: 1.1rem;
          margin: 0;
        }

        .back-section {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .back-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .btn-icon {
          margin-right: 8px;
          font-size: 0.9rem;
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .generator-header h1 {
            font-size: 1.8rem;
            flex-direction: column;
            gap: 10px;
          }

          .header-icon {
            font-size: 2rem;
          }

          .generator-header p {
            font-size: 1rem;
          }

          .back-buttons {
            flex-direction: column;
            align-items: center;
            gap: 15px;
          }

          .back-buttons .btn {
            width: 100%;
            max-width: 250px;
          }
        }

        @media (max-width: 480px) {
          .generator-header h1 {
            font-size: 1.6rem;
          }

          .header-icon {
            font-size: 1.8rem;
          }

          .generator-header p {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AiSqlGenerator;