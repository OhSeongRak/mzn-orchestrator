import numpy as np
import logging
from services.embedding_service import EmbeddingService
from services.task_service import TaskService

logger = logging.getLogger(__name__)


class RAGService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.task_service = TaskService()

    def find_similar_tasks(self, user_sql, top_k=3):
        """유사한 과제 검색"""
        try:
            # 1. 사용자 SQL 전처리 및 임베딩
            processed_sql = self._prepare_sql(user_sql)
            user_embedding = self.embedding_service.create_embedding(processed_sql)
            logger.info(f"사용자 SQL 임베딩 생성 완료")

            # 2. 모든 과제 로드
            all_tasks = self.task_service.get_all_tasks()

            if not all_tasks:
                logger.warning("등록된 과제가 없습니다")
                return []

            logger.info(f"총 {len(all_tasks)}개 과제 로드")

            # 3. 각 과제와 유사도 계산
            similarities = []
            for task in all_tasks:
                task_id = task['task_id']
                task_embedding = self.embedding_service.get_embedding(task_id)

                if not task_embedding:
                    logger.warning(f"과제 {task_id}의 임베딩이 없습니다")
                    # 디버깅: embeddings에 어떤 키들이 있는지 출력
                    logger.debug(f"사용 가능한 키: {list(self.embedding_service.embeddings.keys())[:5]}")

                if task_embedding:
                    similarity = self._cosine_similarity(user_embedding, task_embedding)
                    similarities.append({
                        'task_id': task['task_id'],
                        'title': task['title'],
                        'content': task.get('content', ''),
                        'sql': task['sql'],
                        'author': task.get('author', ''),
                        'created_at': task['created_at'],
                        'similarity': round(similarity * 100, 1)
                    })
                else:
                    logger.warning(f"과제 {task['task_id']}의 임베딩이 없습니다")

            # 4. 유사도 높은 순 정렬
            similarities.sort(key=lambda x: x['similarity'], reverse=True)

            # 5. TOP K 반환
            top_results = similarities[:top_k]

            logger.info(f"유사 과제 검색 완료: {len(top_results)}개")
            for idx, result in enumerate(top_results, 1):
                logger.info(f"  {idx}위: {result['task_id']} ({result['similarity']}%)")

            return top_results

        except Exception as e:
            logger.error(f"RAG 검색 오류: {e}")
            raise

    def _prepare_sql(self, sql):
        """SQL 전처리 (글자수 제한)"""
        MAX_CHARS = 10000

        if len(sql) > MAX_CHARS:
            half = MAX_CHARS // 2
            processed = sql[:half] + "\n...(중략)...\n" + sql[-half:]
            logger.info(f"SQL 길이 제한: {len(sql)}자 → {MAX_CHARS}자")
            return processed

        return sql

    def _cosine_similarity(self, vec1, vec2):
        """코사인 유사도 계산"""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)

        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return dot_product / (norm1 * norm2)