import axios from 'axios';

// API 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:15000';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // 서버가 응답했지만 에러 상태코드
      throw new Error(error.response.data?.error?.message || '서버 오류가 발생했습니다.');
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못함
      throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
    } else {
      // 요청 설정 중 오류 발생
      throw new Error('요청 처리 중 오류가 발생했습니다.');
    }
  }
);

// API 서비스 객체
const apiService = {
  // 헬스체크
  async healthCheck() {
    const response = await apiClient.get('/api/v1/health');
    return response.data;
  },

  // 데이터베이스 관련 API
  database: {
    // DB 연결
    async connect(connectionData) {
      const response = await apiClient.post('/api/v1/database/connect', connectionData);
      return response.data;
    },

    // 테이블 컬럼 조회
    async getTableColumns(schema, tableName) {
      const response = await apiClient.get(`/api/v1/database/tables/${schema}/${tableName}/columns`);
      return response.data;
    },

    // DB 연결 상태 확인
    async getHealthStatus() {
      const response = await apiClient.get('/api/v1/database/health');
      return response.data;
    },
  },

  // 커스텀 SQL 관련 API
  customSql: {
    // 커스텀 SQL 생성
    async generate(sqlData) {
      const response = await apiClient.post('/api/v1/sql/custom/generate', sqlData);
      return response.data;
    },

    // SQL 검증
    async validate(validationData) {
      const response = await apiClient.post('/api/v1/sql/custom/validate', validationData);
      return response.data;
    },
  },

  // AI SQL 관련 API
  aiSql: {
    // AI SQL 생성
    async generate(aiSqlData) {
      // AI SQL 생성은 시간이 오래 걸릴 수 있으므로 타임아웃 연장
      const response = await apiClient.post('/api/v1/sql/ai/generate', aiSqlData, {
        timeout: 180000, // 3분
      });
      return response.data;
    },

    // AI SQL 데이터 미리보기
    async getDataPreview(sourceNeId) {
      const response = await apiClient.get(`/api/v1/sql/ai/tables/${sourceNeId}`);
      return response.data;
    },
  },
};

export default apiService;