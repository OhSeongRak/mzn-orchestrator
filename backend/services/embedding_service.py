import os
import json
import logging
from openai import OpenAI

logger = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다.")

        # SSL 검증 비활성화 (회사 프록시 대응)
        import httpx
        http_client = httpx.Client(
            timeout=60.0,
            verify=False
        )

        self.client = OpenAI(
            api_key=api_key,
            http_client=http_client
        )
        self.embeddings_file = "data/tasks/embeddings.json"
        self.embeddings = self._load_embeddings()

    def _load_embeddings(self):
        """저장된 임베딩 로드"""
        if os.path.exists(self.embeddings_file):
            try:
                with open(self.embeddings_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"임베딩 로드 오류: {e}")
                return {}
        return {}

    def create_embedding(self, text):
        """텍스트를 벡터로 변환"""
        try:
            response = self.client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            embedding = response.data[0].embedding
            logger.info(f"임베딩 생성 완료: {len(embedding)}차원")
            return embedding
        except Exception as e:
            logger.error(f"임베딩 생성 오류: {e}")
            raise

    def save_embedding(self, task_id, embedding):
        """임베딩 저장"""
        try:
            self.embeddings[task_id] = embedding

            # 디렉터리 확인
            os.makedirs(os.path.dirname(self.embeddings_file), exist_ok=True)

            with open(self.embeddings_file, 'w') as f:
                json.dump(self.embeddings, f)

            logger.info(f"임베딩 저장 완료: {task_id}")
        except Exception as e:
            logger.error(f"임베딩 저장 오류: {e}")
            raise

    def delete_embedding(self, task_id):
        """임베딩 삭제"""
        if task_id in self.embeddings:
            del self.embeddings[task_id]
            with open(self.embeddings_file, 'w') as f:
                json.dump(self.embeddings, f)
            logger.info(f"임베딩 삭제 완료: {task_id}")

    def get_embedding(self, task_id):
        """임베딩 조회"""
        return self.embeddings.get(task_id)