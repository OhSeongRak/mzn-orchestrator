import psycopg2
import logging
from flask import session
from config import db_config

logger = logging.getLogger(__name__)

class DatabaseService:
    """데이터베이스 관련 서비스"""
    
    @staticmethod
    def get_connection():
        """데이터베이스 연결 반환"""
        try:
            # 세션에서 DB 정보 가져오기 (우선순위)
            if all(key in session for key in ["DB_HOST", "DB_NAME", "DB_PORT", "DB_USER", "DB_PASS"]):
                conn = psycopg2.connect(
                    host=session["DB_HOST"],
                    database=session["DB_NAME"],
                    port=session["DB_PORT"],
                    user=session["DB_USER"],
                    password=session["DB_PASS"],
                )
                logger.info("세션 정보로 데이터베이스 접속 성공")
            else:
                # 기본 설정 사용
                conn = psycopg2.connect(
                    host=db_config.host,
                    database=db_config.database,
                    port=db_config.port,
                    user=db_config.user,
                    password=db_config.password,
                )
                logger.info("기본 설정으로 데이터베이스 접속 성공")

            return conn

        except psycopg2.Error as e:
            logger.error(f"데이터베이스 접속 실패: {e}")
            raise
        except Exception as e:
            logger.error(f"예상치 못한 오류: {e}")
            raise

    @staticmethod
    def test_connection(host, port, database, user, password):
        """데이터베이스 연결 테스트"""
        try:
            conn = psycopg2.connect(
                host=host,
                database=database,
                port=port,
                user=user,
                password=password
            )
            cursor = conn.cursor()
            cursor.execute("SELECT 1;")
            cursor.close()
            conn.close()
            return True, "연결 성공"
            
        except psycopg2.Error as e:
            return False, f"데이터베이스 연결 실패: {str(e)}"
        except Exception as e:
            return False, f"예상치 못한 오류: {str(e)}"

    @staticmethod
    def get_table_columns(schema, table_name):
        """테이블의 컬럼 정보 조회"""
        if not schema or not table_name:
            raise ValueError("스키마와 테이블명이 필요합니다.")

        conn = None
        cursor = None

        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()


            # SQL 인젝션 방지를 위한 파라미터화된 쿼리
            query = """
                SELECT column_name, udt_name 
                FROM information_schema.columns 
                WHERE table_schema = %s AND table_name = %s
                ORDER BY ordinal_position
            """

            cursor.execute(query, (schema, table_name))
            columns = cursor.fetchall()

            logger.info(f"테이블 {schema}.{table_name}에서 {len(columns)}개의 컬럼 조회 완료")
            return columns

        except psycopg2.Error as e:
            logger.error(f"컬럼 조회 중 데이터베이스 오류: {e}")
            raise
        except Exception as e:
            logger.error(f"컬럼 조회 중 예상치 못한 오류: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def execute_query(query):
        """쿼리 실행 및 결과 반환"""
        conn = None
        cursor = None

        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()

            logger.info(f"쿼리 실행: {query[:100]}...")
            cursor.execute(query)
            
            rows = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]

            logger.info(f"쿼리 실행 완료: {len(rows)}건 조회")
            return rows, colnames

        except psycopg2.Error as e:
            logger.error(f"쿼리 실행 중 데이터베이스 오류: {e}")
            raise
        except Exception as e:
            logger.error(f"쿼리 실행 중 예상치 못한 오류: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()