from flask import Blueprint, request, jsonify, session
import logging
from services.db_service import DatabaseService

logger = logging.getLogger(__name__)

# Blueprint 생성
database_bp = Blueprint('database', __name__, url_prefix='/api/v1/database')

@database_bp.route('/connect', methods=['POST'])
def connect():
    """데이터베이스 연결"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": {"code": "INVALID_REQUEST", "message": "요청 데이터가 없습니다."},
                "timestamp": None
            }), 400

        required_fields = ['host', 'port', 'name', 'user', 'pass']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "success": False,
                    "error": {"code": "MISSING_FIELD", "message": f"{field} 값이 필요합니다."},
                    "timestamp": None
                }), 400

        # DB 연결 테스트
        success, message = DatabaseService.test_connection(
            host=data["host"],
            port=data["port"],
            database=data["name"],
            user=data["user"],
            password=data["pass"]
        )

        if success:
            # 세션에 DB 정보 저장
            session["DB_HOST"] = data["host"]
            session["DB_PORT"] = data["port"]
            session["DB_NAME"] = data["name"]
            session["DB_USER"] = data["user"]
            session["DB_PASS"] = data["pass"]

            logger.info(f"데이터베이스 연결 성공: {data['host']}:{data['port']}/{data['name']}")
            
            return jsonify({
                "success": True,
                "data": {
                    "connection_info": f"{data['host']}:{data['port']}/{data['name']}"
                },
                "message": "데이터베이스 연결이 성공했습니다.",
                "timestamp": None
            })

        else:
            return jsonify({
                "success": False,
                "error": {"code": "CONNECTION_FAILED", "message": message},
                "timestamp": None
            }), 500

    except Exception as e:
        logger.error(f"데이터베이스 연결 처리 중 오류: {e}")
        return jsonify({
            "success": False,
            "error": {"code": "INTERNAL_ERROR", "message": "서버 내부 오류가 발생했습니다."},
            "timestamp": None
        }), 500

@database_bp.route('/tables/<schema>/<table_name>/columns', methods=['GET'])
def get_table_columns(schema, table_name):
    """테이블 컬럼 정보 조회"""
    try:
        if not schema or not table_name:
            return jsonify({
                "success": False,
                "error": {"code": "INVALID_PARAMS", "message": "스키마와 테이블명이 필요합니다."},
                "timestamp": None
            }), 400

        columns = DatabaseService.get_table_columns(schema, table_name)
        
        if not columns:
            return jsonify({
                "success": False,
                "error": {"code": "TABLE_NOT_FOUND", "message": f"테이블 '{table_name}'을 스키마 '{schema}'에서 찾을 수 없습니다."},
                "timestamp": None
            }), 404

        columns_list = [{"column_name": column[0], "udt_name": column[1]} for column in columns]
        
        logger.info(f"컬럼 조회 성공: {schema}.{table_name} ({len(columns_list)}개 컬럼)")

        return jsonify({
            "success": True,
            "data": {
                "columns": columns_list,
                "schema": schema,
                "table_name": table_name,
                "column_count": len(columns_list)
            },
            "message": f"테이블 '{table_name}'의 컬럼을 성공적으로 조회했습니다.",
            "timestamp": None
        })

    except Exception as e:
        logger.error(f"컬럼 정보 조회 오류: {e}")
        return jsonify({
            "success": False,
            "error": {"code": "QUERY_ERROR", "message": f"컬럼 정보 조회 중 오류 발생: {str(e)}"},
            "timestamp": None
        }), 500

@database_bp.route('/health', methods=['GET'])
def health_check():
    """데이터베이스 연결 상태 확인"""
    try:
        # 세션에 DB 정보가 있는지 확인
        if not all(key in session for key in ["DB_HOST", "DB_NAME", "DB_PORT", "DB_USER", "DB_PASS"]):
            return jsonify({
                "success": False,
                "data": {"connected": False, "session_valid": False},
                "message": "데이터베이스 연결 정보가 없습니다.",
                "timestamp": None
            })

        # 실제 연결 테스트
        success, message = DatabaseService.test_connection(
            host=session["DB_HOST"],
            port=session["DB_PORT"],
            database=session["DB_NAME"],
            user=session["DB_USER"],
            password=session["DB_PASS"]
        )

        return jsonify({
            "success": success,
            "data": {
                "connected": success,
                "session_valid": True,
                "connection_info": f"{session['DB_HOST']}:{session['DB_PORT']}/{session['DB_NAME']}" if success else None
            },
            "message": message,
            "timestamp": None
        })

    except Exception as e:
        logger.error(f"헬스체크 오류: {e}")
        return jsonify({
            "success": False,
            "data": {"connected": False, "session_valid": False},
            "error": {"code": "HEALTH_CHECK_ERROR", "message": str(e)},
            "timestamp": None
        }), 500