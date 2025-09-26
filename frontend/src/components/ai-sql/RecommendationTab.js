import React, { useState } from 'react';

const RecommendationTab = ({ recommendations, isLoading }) => {
  const [selectedSql, setSelectedSql] = useState(null);

  const getRankEmoji = (index) => {
    const emojis = ['🥇', '🥈', '🥉'];
    return emojis[index] || '📌';
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#5c6370' }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '3px solid #3e4451',
          borderTop: '3px solid #61dafb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p>유사한 과제를 찾는 중...</p>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#5c6370' }}>
        <p style={{ fontSize: '48px', margin: '0 0 20px 0' }}>🔍</p>
        <p style={{ fontSize: '18px', margin: 0 }}>유사한 과제를 찾지 못했습니다.</p>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>더 많은 과제를 등록해보세요.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px', color: '#abb2bf' }}>
        <p>🤖 AI가 분석한 결과, 다음 과제들과 유사합니다:</p>
      </div>

      {recommendations.map((task, index) => (
        <div
          key={task.task_id}
          style={{
            backgroundColor: '#1e222a',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '1px solid #3e4451',
            transition: 'all 0.3s'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>{getRankEmoji(index)}</span>
              <div>
                <h3 style={{
                  color: '#61dafb',
                  margin: '0 0 4px 0',
                  fontSize: '18px'
                }}>
                  {task.task_id}
                </h3>
                <p style={{
                  color: '#abb2bf',
                  margin: 0,
                  fontSize: '16px'
                }}>
                  {task.title}
                </p>
              </div>
            </div>
            
            <div style={{
              backgroundColor: task.similarity >= 90 ? '#98c379' : 
                             task.similarity >= 80 ? '#e5c07b' : '#61dafb',
              color: '#282c34',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {task.similarity}% 유사
            </div>
          </div>

          {task.content && (
            <p style={{
              color: '#5c6370',
              marginBottom: '16px',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              {task.content.length > 150 
                ? task.content.substring(0, 150) + '...' 
                : task.content}
            </p>
          )}

          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <button
              onClick={() => setSelectedSql(task)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#61dafb',
                color: '#282c34',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4fa8c5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#61dafb'}
            >
              📄 SQL 보기
            </button>

            {task.author && (
              <span style={{ color: '#5c6370', fontSize: '13px' }}>
                👤 {task.author}
              </span>
            )}
            
            <span style={{ color: '#5c6370', fontSize: '13px' }}>
              📅 {new Date(task.created_at).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>
      ))}

      {/* SQL 상세 모달 */}
      {selectedSql && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={() => setSelectedSql(null)}
        >
          <div
            style={{
              backgroundColor: '#282c34',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '900px',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid #3e4451',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: '20px'
            }}>
              <div>
                <h2 style={{ color: '#61dafb', margin: '0 0 8px 0' }}>
                  {selectedSql.task_id}
                </h2>
                <p style={{ color: '#abb2bf', margin: 0 }}>
                  {selectedSql.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedSql(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#abb2bf',
                  fontSize: '32px',
                  cursor: 'pointer',
                  padding: '0 10px',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#e06c75', fontSize: '16px', marginBottom: '12px' }}>
                SQL
              </h3>
              <pre style={{
                backgroundColor: '#1e222a',
                padding: '20px',
                borderRadius: '8px',
                overflow: 'auto',
                color: '#98c379',
                fontSize: '13px',
                fontFamily: 'Monaco, Consolas, monospace',
                maxHeight: '400px',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {selectedSql.sql}
              </pre>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedSql.sql);
                alert('SQL이 클립보드에 복사되었습니다!');
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#98c379',
                color: '#282c34',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              📋 SQL 복사
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RecommendationTab;