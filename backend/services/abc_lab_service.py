import requests
import json
import logging
from config import abc_lab_config

logger = logging.getLogger(__name__)

class ABCLabService:
    """ABC Lab API 호출 서비스"""
    
    @staticmethod
    def validate_sql(sql_data):
        """SQL 정합성 검증"""
        try:
            payload = {
                "inputs": {"type": "verify"},
                "query": sql_data,
                "response_mode": "blocking",
                "conversation_id": "",
                "user": abc_lab_config.user,
            }
            
            response = ABCLabService._make_request(payload)
            logger.info("SQL 검증 API 호출 성공")
            return response
            
        except Exception as e:
            logger.error(f"SQL 검증 API 호출 실패: {e}")
            raise Exception(f"SQL 검증 실패: {str(e)}")

    @staticmethod
    def generate_ai_sql(source_ne_id, target_ne_id, insert_statements):
        """AI SQL 생성 - 일괄 처리 (배치 처리 제거)"""
        try:
            # 간단한 입력값 구성
            query_input = f"""기존 NE_ID: {source_ne_id}
신규 NE_ID: {target_ne_id}
{insert_statements}"""

            payload = {
                "inputs": {},
                "query": query_input,
                "response_mode": "blocking",
                "conversation_id": "",
                "user": abc_lab_config.user,
            }

            logger.info(f"AI SQL 생성 API 호출 시작: {source_ne_id} -> {target_ne_id}")
            logger.info(f"처리할 INSERT문 개수: {len(insert_statements.split('INSERT INTO'))}")

            response = ABCLabService._make_request(payload)
            
            if not response:
                raise Exception("ABC Lab API 응답이 비어있습니다.")

            logger.info("AI SQL 생성 API 호출 성공")
            logger.info(f"응답 길이: {len(response)} 문자")
            
            return response

        except Exception as e:
            logger.error(f"AI SQL 생성 API 호출 실패: {e}")
            raise Exception(f"AI SQL 생성 실패: {str(e)}")

    @staticmethod
    def _make_request(payload):
        """ABC Lab API 요청 공통 처리"""
        headers = {
            "Authorization": f"Bearer {abc_lab_config.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "curl/7.68.0"
        }

        try:
            response = requests.post(
                abc_lab_config.api_url,
                headers=headers,
                json=payload,
                timeout=abc_lab_config.timeout
            )
            response.raise_for_status()

            data = response.json()
            result = data.get("answer", "")
            
            return result

        except requests.RequestException as e:
            logger.error(f"ABC Lab API 요청 실패: {e}")
            raise Exception(f"ABC Lab API 네트워크 오류: {str(e)}")
        except json.JSONDecodeError as e:
            logger.error(f"ABC Lab API 응답 파싱 실패: {e}")
            raise Exception(f"ABC Lab API 응답 형식 오류: {str(e)}")
        except Exception as e:
            logger.error(f"ABC Lab API 호출 중 예상치 못한 오류: {e}")
            raise Exception(f"ABC Lab API 처리 실패: {str(e)}")

    @staticmethod
    def parse_insert_statements(api_response):
        """ABC Lab API 응답을 INSERT문 리스트로 파싱"""
        try:
            if not api_response:
                return []

            # 응답에서 INSERT문들 추출
            lines = api_response.strip().split('\n')
            insert_statements = []

            for line in lines:
                line = line.strip()
                # INSERT문만 추출 (주석, 빈 줄 제외)
                if line.startswith('INSERT INTO') and line.endswith(';'):
                    insert_statements.append(line)

            logger.info(f"API 응답에서 {len(insert_statements)}개의 INSERT문 파싱 완료")
            return insert_statements

        except Exception as e:
            logger.error(f"API 응답 파싱 오류: {e}")
            return []