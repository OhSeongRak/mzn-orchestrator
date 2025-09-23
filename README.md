# SQL Generator Platform Backend

커스텀 SQL 생성 & AI SQL 생성 통합 플랫폼의 백엔드 API 서버입니다.

## 🏗️ 프로젝트 구조

```
backend/
├── app.py                      # Flask 메인 애플리케이션
├── config.py                   # 설정 관리
├── requirements.txt            # 패키지 의존성
├── .env.example               # 환경변수 예시
├── routes/                    # API 라우터들
│   ├── __init__.py
│   ├── database.py           # 데이터베이스 연결, 테이블 조회
│   ├── custom_sql.py         # 커스텀 SQL 생성
│   └── ai_sql.py            # AI SQL 생성 (기존 NE Migration)
└── services/                 # 비즈니스 로직
    ├── __init__.py
    ├── db_service.py         # 데이터베이스 서비스
    ├── sql_service.py        # SQL 생성 로직
    └── abc_lab_service.py    # ABC Lab API 호출
```

## ⚡ 빠른 시작

### 1. 패키지 설치
```bash
pip install -r requirements.txt
```

### 2. 환경 설정 (선택사항)
```bash
cp .env.example .env
# .env 파일 수정 (필요시)
```

### 3. 서버 실행
```bash
python app.py
```

서버가 시작되면 `http://127.0.0.1:15000`에서 접근 가능합니다.

## 📋 API 엔드포인트

### 🏠 기본
- `GET /` - 서비스 정보
- `GET /api/v1/health` - 헬스체크

### 🗄️ 데이터베이스
- `POST /api/v1/database/connect` - DB 연결
- `GET /api/v1/database/tables/{schema}/{table}/columns` - 테이블 컬럼 조회

### ⚙️ 커스텀 SQL
- `POST /api/v1/sql/custom/generate` - 커스텀 SQL 생성
- `POST /api/v1/sql/custom/validate` - SQL 검증

### 🤖 AI SQL 생성
- `POST /api/v1/sql/ai/generate` - AI SQL 생성 (기존 NE Migration)
- `GET /api/v1/sql/ai/tables/{ne_id}` - AI SQL 데이터 미리보기

## 📊 API 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "작업이 성공적으로 완료되었습니다.",
  "timestamp": "2025-09-22T08:30:00Z"
}
```

### 오류 응답
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "오류 메시지"
  },
  "timestamp": "2025-09-22T08:30:00Z"
}
```

## 🔧 주요 개선사항

### ✅ 요구사항 반영
- **배치 처리 제거**: AI SQL 생성에서 일괄 처리로 변경
- **용어 변경**: "NE MIGRATION" → "AI SQL 생성"
- **스키마 추가**: 모든 쿼리에 `kmznmst` 스키마 포함
- **컬럼명 제거**: INSERT문에서 컬럼명 제거
- **DBMS 변환 삭제**: Oracle 변환 로직 제거

### 🏗️ 구조 개선
- **RESTful API**: 의미있는 URL과 HTTP 메서드 사용
- **관심사 분리**: DB, API, SQL 로직을 각각 다른 서비스로 분리
- **표준화된 응답**: 일관된 응답 형식 적용
- **에러 처리**: 단계별 상세한 로깅 및 예외 처리

## 🔗 데이터베이스 연결

기본 설정:
- Host: `10.217.59.149`
- Port: `5444`
- Database: `devkmzn`
- User: `kmznmst`
- Password: `new1234!`

## 🤖 ABC Lab API

AI SQL 생성 기능은 ABC Lab API를 사용합니다:
- URL: `https://api.abclab.ktds.com/v1/chat-messages`
- API Key: `app-ok1DMMGxuFnlgsuBcdQ0pWHu`
- Timeout: `180초`

## 🚀 개발 환경

- Python 3.8+
- Flask 2.3.3
- PostgreSQL (PPAS)
- ABC Lab API

## 📝 로그

애플리케이션 로그는 콘솔에 출력되며, 다음 정보를 포함합니다:
- 데이터베이스 연결 상태
- API 호출 내역
- SQL 생성 결과
- 오류 및 예외 정보