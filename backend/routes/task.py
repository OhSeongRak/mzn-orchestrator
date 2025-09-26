from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
from services.task_service import TaskService
from services.rag_service import RAGService

logger = logging.getLogger(__name__)

task_bp = Blueprint('task', __name__, url_prefix='/api/v1/tasks')
task_service = TaskService()
rag_service = RAGService()


@task_bp.route('', methods=['POST'])
def create_task():
    """과제 등록"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": {"code": "NO_DATA", "message": "데이터가 없습니다."}
            }), 400

        # 필수 항목 검증
        task_id = data.get('task_id', '').strip()
        title = data.get('title', '').strip()
        sql = data.get('sql', '').strip()

        if not task_id:
            return jsonify({
                "success": False,
                "error": {"code": "MISSING_TASK_ID", "message": "과제번호를 입력해주세요."}
            }), 400

        if not title:
            return jsonify({
                "success": False,
                "error": {"code": "MISSING_TITLE", "message": "과제명을 입력해주세요."}
            }), 400

        if not sql:
            return jsonify({
                "success": False,
                "error": {"code": "MISSING_SQL", "message": "SQL문을 입력해주세요."}
            }), 400

        # 과제 ID 형식 검증 (DR-로 시작)
        if not task_id.startswith('DR-'):
            return jsonify({
                "success": False,
                "error": {
                    "code": "INVALID_TASK_ID",
                    "message": "과제번호는 DR-로 시작해야 합니다. (예: DR-2025-12345)"
                }
            }), 400

        # 중복 체크
        if task_service.get_task(task_id):
            return jsonify({
                "success": False,
                "error": {
                    "code": "DUPLICATE_TASK_ID",
                    "message": f"과제번호 '{task_id}'가 이미 존재합니다."
                }
            }), 400

        # 과제 생성
        task = task_service.create_task(
            task_id=task_id,
            title=title,
            content=data.get('content', '').strip(),
            sql=sql,
            author=data.get('author', '').strip()
        )

        logger.info(f"✅ 과제 등록 완료: {task_id}")

        return jsonify({
            "success": True,
            "data": task,
            "message": f"과제가 등록되었습니다. ({task_id})",
            "timestamp": datetime.now().isoformat()
        }), 201

    except Exception as e:
        logger.error(f"❌ 과제 등록 오류: {e}")
        return jsonify({
            "success": False,
            "error": {
                "code": "CREATE_ERROR",
                "message": f"과제 등록 중 오류가 발생했습니다: {str(e)}"
            }
        }), 500


@task_bp.route('', methods=['GET'])
def get_tasks():
    """과제 목록 조회"""
    try:
        tasks = task_service.get_all_tasks()

        return jsonify({
            "success": True,
            "data": {
                "tasks": tasks,
                "total": len(tasks)
            },
            "message": f"{len(tasks)}개의 과제를 조회했습니다.",
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"❌ 과제 목록 조회 오류: {e}")
        return jsonify({
            "success": False,
            "error": {
                "code": "LIST_ERROR",
                "message": f"과제 목록 조회 중 오류가 발생했습니다: {str(e)}"
            }
        }), 500


@task_bp.route('/<task_id>', methods=['GET'])
def get_task(task_id):
    """과제 상세 조회"""
    try:
        task = task_service.get_task(task_id)

        if not task:
            return jsonify({
                "success": False,
                "error": {
                    "code": "NOT_FOUND",
                    "message": f"과제 '{task_id}'를 찾을 수 없습니다."
                }
            }), 404

        return jsonify({
            "success": True,
            "data": task,
            "message": "과제를 조회했습니다.",
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"❌ 과제 조회 오류: {e}")
        return jsonify({
            "success": False,
            "error": {
                "code": "GET_ERROR",
                "message": f"과제 조회 중 오류가 발생했습니다: {str(e)}"
            }
        }), 500


@task_bp.route('/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    """과제 삭제"""
    try:
        success = task_service.delete_task(task_id)

        if not success:
            return jsonify({
                "success": False,
                "error": {
                    "code": "NOT_FOUND",
                    "message": f"과제 '{task_id}'를 찾을 수 없습니다."
                }
            }), 404

        logger.info(f"✅ 과제 삭제 완료: {task_id}")

        return jsonify({
            "success": True,
            "message": f"과제 '{task_id}'가 삭제되었습니다.",
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"❌ 과제 삭제 오류: {e}")
        return jsonify({
            "success": False,
            "error": {
                "code": "DELETE_ERROR",
                "message": f"과제 삭제 중 오류가 발생했습니다: {str(e)}"
            }
        }), 500


@task_bp.route('/recommend', methods=['POST'])
def recommend_similar():
    """유사 과제 추천 (RAG)"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": {"code": "NO_DATA", "message": "데이터가 없습니다."}
            }), 400

        user_sql = data.get('sql', '').strip()

        if not user_sql:
            return jsonify({
                "success": False,
                "error": {"code": "MISSING_SQL", "message": "SQL문을 입력해주세요."}
            }), 400

        # RAG 검색
        recommendations = rag_service.find_similar_tasks(user_sql, top_k=3)

        logger.info(f"✅ 유사 과제 추천 완료: {len(recommendations)}개")

        return jsonify({
            "success": True,
            "data": {
                "recommendations": recommendations,
                "total": len(recommendations)
            },
            "message": f"{len(recommendations)}개의 유사 과제를 찾았습니다.",
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"❌ 유사 과제 추천 오류: {e}")
        return jsonify({
            "success": False,
            "error": {
                "code": "RECOMMEND_ERROR",
                "message": f"추천 중 오류가 발생했습니다: {str(e)}"
            }
        }), 500