import os
import json
import logging
from datetime import datetime
from services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class TaskService:
    def __init__(self):
        self.tasks_dir = "data/tasks"
        self.embedding_service = EmbeddingService()
        self._ensure_directory()

    def _ensure_directory(self):
        """디렉터리 생성"""
        if not os.path.exists(self.tasks_dir):
            os.makedirs(self.tasks_dir)
            logger.info(f"과제 디렉터리 생성: {self.tasks_dir}")

    def create_task(self, task_id, title, content, sql, author=""):
        """과제 생성"""
        filepath = None
        try:
            # 1. 과제 데이터 구성
            task = {
                "task_id": task_id,
                "title": title,
                "content": content,
                "sql": sql,
                "author": author,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }

            # 2. JSON 파일 저장
            filepath = os.path.join(self.tasks_dir, f"{task_id}.json")
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(task, f, ensure_ascii=False, indent=2)

            logger.info(f"과제 파일 저장 완료: {filepath}")

            # 3. 임베딩 생성 및 저장
            # SQL이 너무 길면 잘라서 임베딩 (10,000자 제한)
            MAX_CHARS = 10000
            if len(sql) > MAX_CHARS:
                # 앞 5,000자 + 뒤 5,000자
                half = MAX_CHARS // 2
                sql_preview = sql[:half] + "\n...(중략)...\n" + sql[-half:]
                logger.info(f"⚠️ SQL 길이 제한: {len(sql)}자 → {MAX_CHARS}자")
            else:
                sql_preview = sql

            embedding_text = f"{title}\n{content}\n{sql_preview}"
            embedding = self.embedding_service.create_embedding(embedding_text)
            self.embedding_service.save_embedding(task_id, embedding)

            logger.info(f"✅ 과제 생성 완료: {task_id}")
            return task

        except Exception as e:
            # 임베딩 실패 시 저장된 파일 삭제 (롤백)
            if filepath and os.path.exists(filepath):
                os.remove(filepath)
                logger.warning(f"⚠️ 롤백: 파일 삭제됨 - {filepath}")

            logger.error(f"❌ 과제 생성 오류: {e}")
            raise

    def get_task(self, task_id):
        """과제 조회"""
        filepath = os.path.join(self.tasks_dir, f"{task_id}.json")

        if not os.path.exists(filepath):
            return None

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"과제 조회 오류: {e}")
            return None

    def get_all_tasks(self):
        """모든 과제 조회"""
        tasks = []

        try:
            for filename in os.listdir(self.tasks_dir):
                # JSON 파일만 (embeddings.json 제외)
                if filename.endswith('.json') and filename != 'embeddings.json':
                    filepath = os.path.join(self.tasks_dir, filename)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        tasks.append(json.load(f))

            # 최신순 정렬
            tasks.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            logger.info(f"과제 목록 조회: {len(tasks)}개")

        except Exception as e:
            logger.error(f"과제 목록 조회 오류: {e}")

        return tasks

    def delete_task(self, task_id):
        """과제 삭제"""
        filepath = os.path.join(self.tasks_dir, f"{task_id}.json")

        if not os.path.exists(filepath):
            return False

        try:
            # 1. 파일 삭제
            os.remove(filepath)
            logger.info(f"과제 파일 삭제: {filepath}")

            # 2. 임베딩 삭제
            self.embedding_service.delete_embedding(task_id)

            logger.info(f"과제 삭제 완료: {task_id}")
            return True

        except Exception as e:
            logger.error(f"과제 삭제 오류: {e}")
            return False