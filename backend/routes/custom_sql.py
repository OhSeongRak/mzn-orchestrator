from flask import Blueprint, request, jsonify
import logging
from services.db_service import DatabaseService
from services.sql_service import SQLService
from services.abc_lab_service import ABCLabService

logger = logging.getLogger(__name__)

# Blueprint 생성
custom_sql_bp = Blueprint('custom_sql', __name__, url_prefix='/api/v1/sql/custom')

@custom_sql_bp.route('/generate', methods=['POST'])
def generate_custom_sql():
    """커스텀 SQL 생성"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": {"code": "INVALID_REQUEST", "message": "요청 데이터가 없습니다."},
                "timestamp": None
            }), 400

        schema = data.get("schema")
        table_name = data.get("table_name")

        if not schema or not table_name:
            return jsonify({
                "success": False,
                "error": {"code": "MISSING_PARAMS", "message": "스키마와 테이블명이 필요합니다."},
                "timestamp": None
            }), 400

        # 테이블 컬럼 정보 조회
        columns = DatabaseService.get_table_columns(schema, table_name)
        if not columns:
            return jsonify({
                "success": False,
                "error": {"code": "TABLE_NOT_FOUND", "message": f"테이블 '{table_name}'을 스키마 '{schema}'에서 찾을 수 없습니다."},
                "timestamp": None
            }), 404

        # 커스텀 SQL 템플릿 생성
        sql_template = SQLService.generate_custom_sql(schema, table_name, columns, data)

        # SQL 실행하여 결과 조회
        rows, colnames = DatabaseService.execute_query(sql_template)

        logger.info(f"커스텀 SQL 생성 완료: {len(rows)}건의 데이터 생성")

        return jsonify({
            "success": True,
            "data": {
                "sql_template": sql_template,
                "columns": colnames,
                "rows": rows,
                "record_count": len(rows),
                "schema": schema,
                "table_name": table_name
            },
            "message": f"커스텀 SQL이 성공적으로 생성되었습니다. ({len(rows)}건)",
            "timestamp": None
        })

    except ValueError as e:
        logger.error(f"커스텀 SQL 생성 검증 오류: {e}")
        return jsonify({
            "success": False,
            "error": {"code": "VALIDATION_ERROR", "message": str(e)},
            "timestamp": None
        }), 400

    except Exception as e:
        logger.error(f"커스텀 SQL 생성 오류: {e}")
        return jsonify({
            "success": False,
            "error": {"code": "SQL_GENERATION_ERROR", "message": f"SQL 생성 중 오류 발생: {str(e)}"},
            "timestamp": None
        }), 500

@custom_sql_bp.route('/validate', methods=['POST'])
def validate_sql():
    """SQL 정합성 검증"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": {"code": "INVALID_REQUEST", "message": "요청 데이터가 없습니다."},
                "timestamp": None
            }), 400

        table_data = data.get("table_data", [])
        schema = data.get("schema")
        table_name = data.get("table_name")

        if not table_data:
            return jsonify({
                "success": False,
                "error": {"code": "MISSING_DATA", "message": "검증할 데이터가 없습니다."},
                "timestamp": None
            }), 400

        # 테이블 정보 조회
        columns_info = DatabaseService.get_table_columns(schema, table_name) if schema and table_name else []

        # SQL 데이터 구성
        ai_query = []
        for item in table_data:
            if isinstance(item, list):
                ai_query.extend(item)
            else:
                ai_query.append(item)

        # 검증 입력 데이터 구성
        if columns_info:
            col_names = ", ".join([col[0] for col in columns_info])
            db_types = ", ".join([col[1] for col in columns_info])
            verification_input = "\n".join([col_names, db_types] + ai_query)
        else:
            verification_input = "\n".join(ai_query)

        # ABC Lab API로 검증
        verification_result = ABCLabService.validate_sql(verification_input)

        logger.info(f"SQL 검증 완료: {len(ai_query)}개 SQL문 검증")

        return jsonify({
            "success": True,
            "data": {
                "verification_result": verification_result,
                "validated_count": len(ai_query),
                "table_info": {
                    "schema": schema,
                    "table": table_name,
                    "columns": col_names if columns_info else None
                }
            },
            "message": "SQL 검증이 완료되었습니다.",
            "timestamp": None
        })

    except Exception as e:
        logger.error(f"SQL 검증 오류: {e}")
        return jsonify({
            "success": False,
            "error": {"code": "VALIDATION_ERROR", "message": f"SQL 검증 중 오류 발생: {str(e)}"},
            "timestamp": None
        }), 500