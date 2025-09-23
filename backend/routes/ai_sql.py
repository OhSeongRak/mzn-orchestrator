from flask import Blueprint, request, jsonify
import logging
from services.sql_service import SQLService
from services.abc_lab_service import ABCLabService

logger = logging.getLogger(__name__)

# Blueprint 생성
ai_sql_bp = Blueprint('ai_sql', __name__, url_prefix='/api/v1/sql/ai')

@ai_sql_bp.route('/generate', methods=['POST'])
def generate_ai_sql():
    """AI SQL 생성 """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": {"code": "INVALID_REQUEST", "message": "요청 데이터가 없습니다."},
                "timestamp": None
            }), 400

        source_ne_id = data.get("source_ne_id", "").strip()
        target_ne_id = data.get("target_ne_id", "").strip()

        if not source_ne_id or not target_ne_id:
            return jsonify({
                "success": False,
                "error": {"code": "MISSING_PARAMS", "message": "기준 NE ID와 신규 NE ID를 모두 입력해주세요."},
                "timestamp": None
            }), 400

        if source_ne_id == target_ne_id:
            return jsonify({
                "success": False,
                "error": {"code": "INVALID_PARAMS", "message": "기준 NE ID와 신규 NE ID는 서로 달라야 합니다."},
                "timestamp": None
            }), 400

        logger.info(f"AI SQL 생성 시작: {source_ne_id} -> {target_ne_id}")

        # 5개 테이블 데이터 조회
        migration_results, total_insert_count = SQLService.get_ai_sql_tables_data(source_ne_id)

        # 모든 INSERT문을 하나로 합치기 (배치 처리 제거)
        all_statements = []
        table_order = ["tb_cdrsend_base_info", "tb_cdrcoll_base_info", "tb_cdrcoll_srvr_info", "tb_wflow_info", "tb_file_fmt_info"]

        for table_name in table_order:
            if table_name in migration_results and migration_results[table_name]["statements"]:
                all_statements.extend(migration_results[table_name]["statements"])

        if not all_statements:
            return jsonify({
                "success": False,
                "error": {"code": "NO_DATA", "message": f"기준 NE ID '{source_ne_id}'에 해당하는 데이터가 없습니다."},
                "timestamp": None
            }), 404

        # ABC Lab API 일괄 호출 (배치 처리 제거)
        try:
            logger.info(f"ABC Lab API 일괄 처리 시작: 총 {len(all_statements)}개 INSERT문")

            # 모든 INSERT문을 문자열로 변환
            statements_text = "\n".join(all_statements)

            # ABC Lab API 호출
            converted_response = ABCLabService.generate_ai_sql(source_ne_id, target_ne_id, statements_text)

            # 응답 파싱
            converted_statements = ABCLabService.parse_insert_statements(converted_response)

            if converted_statements:
                # 변환된 결과를 테이블별로 재분배 (단순화)
                # 실제로는 API 응답에서 테이블별 구분이 어려우므로, 전체를 하나로 처리
                final_results = {
                    "ai_generated_sql": {
                        "count": len(converted_statements),
                        "statements": converted_statements,
                        "raw_response": converted_response
                    }
                }

                logger.info(f"ABC Lab API 변환 완료: {len(all_statements)}개 → {len(converted_statements)}개")
            else:
                logger.warning("ABC Lab API 변환 결과 파싱 실패, 원본 사용")
                final_results = {
                    "original_sql": {
                        "count": len(all_statements),
                        "statements": all_statements
                    }
                }

        except Exception as api_error:
            logger.error(f"ABC Lab API 호출 실패: {api_error}")
            logger.warning("API 변환 실패, 원본 INSERT문 사용")

            final_results = {
                "original_sql": {
                    "count": len(all_statements),
                    "statements": all_statements
                }
            }

        # 최종 응답 구성
        total_converted = sum(result["count"] for result in final_results.values())

        result = {
            "success": True,
            "data": {
                "source_ne_id": source_ne_id,
                "target_ne_id": target_ne_id,
                "original_table_count": len([t for t in migration_results.values() if t["count"] > 0]),
                "original_insert_count": total_insert_count,
                "final_insert_count": total_converted,
                "table_results": migration_results,  # 원본 테이블별 결과
                "final_results": final_results      # 변환된 최종 결과
            },
            "message": f"AI SQL 생성이 완료되었습니다. (총 {total_converted}개 INSERT문)",
            "timestamp": None
        }

        logger.info(f"AI SQL 생성 완료: {total_converted}개 INSERT문 생성")
        return jsonify(result)

    except ValueError as e:
        logger.error(f"AI SQL 생성 검증 오류: {e}")
        return jsonify({
            "success": False,
            "error": {"code": "VALIDATION_ERROR", "message": str(e)},
            "timestamp": None
        }), 400

    except Exception as e:
        logger.error(f"AI SQL 생성 중 예상치 못한 오류: {e}")
        return jsonify({
            "success": False,
            "error": {"code": "AI_SQL_ERROR", "message": f"AI SQL 생성 중 오류 발생: {str(e)}"},
            "timestamp": None
        }), 500

@ai_sql_bp.route('/tables/<source_ne_id>', methods=['GET'])
def get_ai_sql_data_preview(source_ne_id):
    """AI SQL 생성용 데이터 미리보기"""
    try:
        if not source_ne_id:
            return jsonify({
                "success": False,
                "error": {"code": "MISSING_PARAMS", "message": "기준 NE ID가 필요합니다."},
                "timestamp": None
            }), 400

        # 5개 테이블 데이터 조회 (INSERT문 생성 없이 조회만)
        migration_results, total_insert_count = SQLService.get_ai_sql_tables_data(source_ne_id)

        # 통계 정보만 반환
        table_stats = {}
        for table_name, data in migration_results.items():
            table_stats[table_name] = {
                "count": data["count"],
                "has_data": data["count"] > 0
            }

        return jsonify({
            "success": True,
            "data": {
                "source_ne_id": source_ne_id,
                "table_stats": table_stats,
                "total_records": total_insert_count,
                "tables_with_data": len([t for t in table_stats.values() if t["has_data"]])
            },
            "message": f"데이터 미리보기 완료. (총 {total_insert_count}건 발견)",
            "timestamp": None
        })

    except Exception as e:
        logger.error(f"AI SQL 데이터 미리보기 오류: {e}")
        return jsonify({
            "success": False,
            "error": {"code": "PREVIEW_ERROR", "message": f"데이터 미리보기 중 오류 발생: {str(e)}"},
            "timestamp": None
        }), 500