import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    task_id: '',
    title: '',
    content: '',
    sql: '',
    author: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/v1/tasks');
      if (response.data.success) {
        setTasks(response.data.data.tasks);
      }
    } catch (error) {
      console.error('과제 목록 조회 오류:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/v1/tasks', formData);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: `✅ ${response.data.message}` });
        setFormData({ task_id: '', title: '', content: '', sql: '', author: '' });
        fetchTasks(); // 목록 새로고침
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || '과제 등록 실패';
      setMessage({ type: 'error', text: `❌ ${errorMsg}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm(`'${taskId}' 과제를 삭제하시겠습니까?`)) return;

    try {
      const response = await axios.delete(`/api/v1/tasks/${taskId}`);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: `✅ ${response.data.message}` });
        fetchTasks(); // 목록 새로고침
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || '과제 삭제 실패';
      setMessage({ type: 'error', text: `❌ ${errorMsg}` });
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      {/* 메시지 알림 */}
      {message.text && (
        <div style={{
          padding: '12px 20px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      {/* 과제 등록 폼 */}
      <div style={{
        backgroundColor: '#282c34',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '40px',
        border: '1px solid #3e4451'
      }}>
        <h2 style={{ color: '#61dafb', marginBottom: '24px' }}>📝 과제 등록</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#abb2bf', marginBottom: '8px' }}>
              과제번호 <span style={{ color: '#e06c75' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.task_id}
              onChange={(e) => setFormData({...formData, task_id: e.target.value})}
              placeholder="DR-2025-12345"
              required
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1e222a',
                border: '1px solid #3e4451',
                borderRadius: '6px',
                color: '#abb2bf',
                fontSize: '14px'
              }}
            />
            <small style={{ color: '#5c6370', fontSize: '12px' }}>
              형식: DR-YYYY-NNNNN
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#abb2bf', marginBottom: '8px' }}>
              과제명 <span style={{ color: '#e06c75' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="CDR 수집 서버 신규 등록"
              required
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1e222a',
                border: '1px solid #3e4451',
                borderRadius: '6px',
                color: '#abb2bf',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#abb2bf', marginBottom: '8px' }}>
              과제 내용
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="과제에 대한 상세 설명을 입력하세요..."
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1e222a',
                border: '1px solid #3e4451',
                borderRadius: '6px',
                color: '#abb2bf',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#abb2bf', marginBottom: '8px' }}>
              SQL문 <span style={{ color: '#e06c75' }}>*</span>
            </label>
            <textarea
              value={formData.sql}
              onChange={(e) => setFormData({...formData, sql: e.target.value})}
              placeholder="INSERT INTO kmznmst.tb_cdrsend_base_info..."
              rows="10"
              required
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1e222a',
                border: '1px solid #3e4451',
                borderRadius: '6px',
                color: '#98c379',
                fontSize: '13px',
                fontFamily: 'Monaco, Consolas, monospace',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#abb2bf', marginBottom: '8px' }}>
              작성자
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              placeholder="홍길동"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1e222a',
                border: '1px solid #3e4451',
                borderRadius: '6px',
                color: '#abb2bf',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: isSubmitting ? '#3e4451' : '#61dafb',
              color: '#282c34',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {isSubmitting ? '등록 중...' : '📋 과제 등록'}
          </button>
        </form>
      </div>

      {/* 과제 목록 */}
      <div style={{
        backgroundColor: '#282c34',
        padding: '30px',
        borderRadius: '12px',
        border: '1px solid #3e4451'
      }}>
        <h2 style={{ color: '#61dafb', marginBottom: '20px' }}>
          📋 등록된 과제 ({tasks.length}개)
        </h2>

        {tasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#5c6370'
          }}>
            등록된 과제가 없습니다.
          </div>
        ) : (
          <div>
            {tasks.map((task) => (
              <div
                key={task.task_id}
                style={{
                  backgroundColor: '#1e222a',
                  padding: '20px',
                  marginBottom: '12px',
                  borderRadius: '8px',
                  border: '1px solid #3e4451',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setSelectedTask(task)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#282c34';
                  e.currentTarget.style.borderColor = '#61dafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e222a';
                  e.currentTarget.style.borderColor = '#3e4451';
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      color: '#61dafb',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}>
                      {task.task_id}
                    </span>
                    <span style={{ color: '#abb2bf', fontSize: '14px' }}>
                      {task.title}
                    </span>
                  </div>
                  
                  {task.content && (
                    <div style={{
                      color: '#5c6370',
                      fontSize: '13px',
                      marginBottom: '8px'
                    }}>
                      {task.content.length > 100 
                        ? task.content.substring(0, 100) + '...' 
                        : task.content}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#5c6370'
                  }}>
                    {task.author && (
                      <span>👤 {task.author}</span>
                    )}
                    <span>
                      📅 {new Date(task.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>

                <button
                //   onClick={() => handleDelete(task.task_id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(task.task_id);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#e06c75',
                    border: '1px solid #e06c75',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.3s',
                    marginLeft: '20px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e06c75';
                    e.target.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#e06c75';
                  }}
                >
                  🗑️ 삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 과제 상세 모달 */}
      {selectedTask && (
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
            zIndex: 1000
          }}
          onClick={() => setSelectedTask(null)}
        >
          <div
            style={{
              backgroundColor: '#282c34',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid #3e4451',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <h2 style={{ color: '#61dafb', margin: 0 }}>{selectedTask.task_id}</h2>
              <button
                onClick={() => setSelectedTask(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#abb2bf',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0 10px'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#e06c75', fontSize: '18px', marginBottom: '8px' }}>과제명</h3>
              <p style={{ color: '#abb2bf', margin: 0 }}>{selectedTask.title}</p>
            </div>

            {selectedTask.content && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#e06c75', fontSize: '18px', marginBottom: '8px' }}>과제 내용</h3>
                <p style={{ color: '#abb2bf', whiteSpace: 'pre-wrap', margin: 0 }}>{selectedTask.content}</p>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#e06c75', fontSize: '18px', marginBottom: '8px' }}>SQL</h3>
              <pre style={{
                backgroundColor: '#1e222a',
                padding: '16px',
                borderRadius: '8px',
                overflow: 'auto',
                color: '#98c379',
                fontSize: '13px',
                fontFamily: 'Monaco, Consolas, monospace',
                maxHeight: '300px',
                margin: 0
              }}>
                {selectedTask.sql}
              </pre>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#5c6370' }}>
              {selectedTask.author && <span>👤 {selectedTask.author}</span>}
              <span>📅 {new Date(selectedTask.created_at).toLocaleString('ko-KR')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement