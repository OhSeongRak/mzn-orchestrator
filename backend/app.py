import os
import sys
import logging
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS

# 설정 import
from config import app_config

# Blueprint import
from routes.database import database_bp
from routes.custom_sql import custom_sql_bp
from routes.ai_sql import ai_sql_bp

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """Flask 앱 팩토리"""
    app = Flask(__name__)
    
    # 설정
    app.secret_key = app_config.secret_key
    
    # CORS 설정
    CORS(app)
    
    # Blueprint 등록
    app.register_blueprint(database_bp)
    app.register_blueprint(custom_sql_bp)
    app.register_blueprint(ai_sql_bp)
    
    # 글로벌 에러 핸들러
    @app.errorhandler(404)
    def not_found(error):
        logger.warning(f"404 오류: {error}")
        return jsonify({
            "success": False,
            "error": {"code": "NOT_FOUND", "message": "요청한 리소스를 찾을 수 없습니다."},
            "timestamp": datetime.now().isoformat()
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"500 오류: {str(error)}")
        return jsonify({
            "success": False,
            "error": {"code": "INTERNAL_ERROR", "message": "서버 내부 오류가 발생했습니다."},
            "timestamp": datetime.now().isoformat()
        }), 500

    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.error(f"예상치 못한 오류: {str(e)}")
        return jsonify({
            "success": False,
            "error": {"code": "UNEXPECTED_ERROR", "message": f"예상치 못한 오류가 발생했습니다: {str(e)}"},
            "timestamp": datetime.now().isoformat()
        }), 500

    # 루트 라우트
    @app.route('/')
    def home():
        return jsonify({
            "success": True,
            "data": {
                "service": "MZN Orchestrator API",
                "version": "2.0.0",
                "description": "커스텀 SQL 생성 & AI SQL 생성 통합 플랫폼",
                "endpoints": {
                    "database": "/api/v1/database/*",
                    "custom_sql": "/api/v1/sql/custom/*",
                    "ai_sql": "/api/v1/sql/ai/*"
                }
            },
            "message": "MZN Orchestrator API 서버가 정상적으로 실행 중입니다.",
            "timestamp": datetime.now().isoformat()
        })

    # 헬스체크 엔드포인트
    @app.route('/api/v1/health')
    def health():
        return jsonify({
            "success": True,
            "data": {
                "status": "healthy",
                "service": "MZN Orchestrator",
                "version": "2.0.0",
                "uptime": "running"
            },
            "message": "서버가 정상적으로 작동 중입니다.",
            "timestamp": datetime.now().isoformat()
        })

    return app

def main():
    """메인 실행 함수"""
    app = create_app()
    
    # 개발 환경 체크
    if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        print("=" * 70)
        print("🚀 MZN Orchestrator v2.0 Backend 서버 시작!")
        print(f"📍 URL: http://{app_config.host}:{app_config.port}")
        print("📝 새로운 기능: AI SQL 생성 (기존 NE Migration)")
        print("🔧 RESTful API 구조로 개선")
        print("⏹️  중지하려면 Ctrl+C를 누르세요")
        print("=" * 70)
        print("\n📋 API Endpoints:")
        print(f"  • GET    / - 서비스 정보")
        print(f"  • GET    /api/v1/health - 헬스체크")
        print(f"  • POST   /api/v1/database/connect - DB 연결")
        print(f"  • GET    /api/v1/database/tables/<schema>/<table>/columns - 테이블 컬럼 조회")
        print(f"  • POST   /api/v1/sql/custom/generate - 커스텀 SQL 생성")
        print(f"  • POST   /api/v1/sql/custom/validate - SQL 검증")
        print(f"  • POST   /api/v1/sql/ai/generate - AI SQL 생성")
        print(f"  • GET    /api/v1/sql/ai/tables/<ne_id> - AI SQL 데이터 미리보기")
        print("=" * 70)

    try:
        app.run(
            host=app_config.host,
            port=app_config.port,
            debug=app_config.debug
        )
    except KeyboardInterrupt:
        print("\n⏹️ 서버가 종료되었습니다.")
    except Exception as e:
        print(f"❌ 서버 시작 오류: {e}")

if __name__ == "__main__":
    main()