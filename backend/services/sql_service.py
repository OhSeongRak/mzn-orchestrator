import logging
from services.db_service import DatabaseService

logger = logging.getLogger(__name__)

class SQLService:
    """SQL 생성 관련 서비스"""

    @staticmethod
    def generate_field_template(option, column_name, column_type, data):
        """컬럼 옵션에 따른 필드 템플릿 생성"""
        try:
            field_template = ""
            quote = "''''||"
            need_quote = False

            # 옵션별 템플릿 생성
            if option == "default":
                # 원본 값 사용
                if column_type == "numeric":
                    field_template = f"CASE WHEN {column_name} IS NULL THEN 'NULL' ELSE ''||{column_name}||'' END||"
                elif column_type == "varchar":
                    field_template = f"CASE WHEN {column_name} IS NULL THEN 'NULL' ELSE ''''||{column_name}||'''' END||"
                elif column_type == "timestamp":
                    field_template = f"CASE WHEN {column_name} IS NULL THEN 'NULL' ELSE 'DATE('''||{column_name}::text||''')' END||"
                else:
                    field_template = f"CASE WHEN {column_name} IS NULL THEN 'NULL' ELSE ''''||{column_name}::text||'''' END||"

            elif option == "replace":
                # 특정 단어 교체
                value1 = data.get(f"{column_name}_value1", "")
                value2 = data.get(f"{column_name}_value2", "")

                if not value1:
                    logger.warning(f"컬럼 {column_name}에 대한 교체할 값이 지정되지 않음")

                field_template = f"CASE WHEN {column_name} IS NULL THEN 'NULL' ELSE ''''||REPLACE({column_name}, '{value1}', '{value2}')||'''' END||"

            elif option == "now":
                # 현재 시각 사용
                field_template = "'NOW()'||"

            elif option == "user_input":
                # 사용자 입력 값
                value = data.get(f"{column_name}_value", "")

                if column_type == "numeric":
                    try:
                        if value:
                            float(value)  # 유효성 검사
                            field_template = f"'{value}'||"
                        else:
                            field_template = "'NULL'||"
                    except ValueError:
                        logger.warning(f"컬럼 {column_name}에 대한 숫자 값이 올바르지 않음: {value}")
                        field_template = "'NULL'||"
                elif column_type == "varchar":
                    if value:
                        field_template = f"'{value}'||"
                        need_quote = True
                    else:
                        field_template = "'NULL'||"
                elif column_type == "timestamp":
                    if value:
                        field_template = f"'DATE(''{value}'')'||"
                    else:
                        field_template = "'NULL'||"
                else:
                    if value:
                        field_template = f"'{value}'||"
                        need_quote = True
                    else:
                        field_template = "'NULL'||"

            else:
                logger.warning(f"알 수 없는 옵션: {option}")
                field_template = f"CASE WHEN {column_name} IS NULL THEN 'NULL' ELSE ''''||{column_name}::text||'''' END||"

            # VARCHAR의 사용자 입력값에만 추가 따옴표 적용
            if need_quote and option == "user_input" and column_type == "varchar":
                field_template = quote + field_template + quote

            return field_template

        except Exception as e:
            logger.error(f"필드 템플릿 생성 중 오류: {e}")
            raise

    @staticmethod
    def generate_custom_sql(schema, table_name, columns, form_data):
        """커스텀 SQL 생성"""
        try:
            field_list = []
            
            for idx, (column_name, column_type) in enumerate(columns):
                option = form_data.get(f"{column_name}_option", "default")
                field_template = SQLService.generate_field_template(option, column_name, column_type, form_data)

                if field_template == "404":
                    raise ValueError(f"컬럼 '{column_name}'의 날짜 형식이 올바르지 않습니다.")

                if idx < len(columns) - 1:
                    field_template += "','||\n"
                field_list.append(field_template)

            if not field_list:
                raise ValueError(f"테이블 '{table_name}'에 대해 선택된 컬럼이 없습니다.")

            # 스키마 포함된 SQL 템플릿 생성
            sql_template = f"SELECT 'INSERT INTO {schema}.{table_name} VALUES('||\n{''.join(field_list)}');' as sql FROM {schema}.{table_name}"

            # WHERE 절 처리
            where_clause = form_data.get("where_clause", "").strip()
            if where_clause:
                if not where_clause.upper().startswith("WHERE"):
                    where_clause = f"WHERE {where_clause}"
                sql_template += f"\n{where_clause};"
            else:
                sql_template += ";"

            logger.info(f"커스텀 SQL 템플릿 생성 완료: {schema}.{table_name}")
            return sql_template

        except Exception as e:
            logger.error(f"커스텀 SQL 생성 중 오류: {e}")
            raise

    @staticmethod
    def execute_and_generate_inserts(query, schema, table_name):
        """쿼리 실행하여 INSERT문 생성"""
        try:
            rows, colnames = DatabaseService.execute_query(query)

            if not rows:
                logger.warning(f"테이블 {schema}.{table_name}에서 조회된 데이터가 없습니다.")
                return []

            insert_statements = []
            for row in rows:
                values = []
                for value in row:
                    if value is None:
                        values.append('NULL')
                    elif isinstance(value, str):
                        escaped_value = value.replace("'", "''")
                        values.append(f"'{escaped_value}'")
                    else:
                        values.append(str(value))

                # 컬럼명 제거하고 스키마 포함된 INSERT문 생성
                insert_sql = f"INSERT INTO {schema}.{table_name} VALUES ({', '.join(values)});"
                insert_statements.append(insert_sql)

            logger.info(f"테이블 {schema}.{table_name}: {len(insert_statements)}개 INSERT문 생성 완료")
            return insert_statements

        except Exception as e:
            logger.error(f"INSERT문 생성 중 오류 ({schema}.{table_name}): {e}")
            raise

    @staticmethod
    def get_ai_sql_tables_data(source_ne_id):
        """AI SQL 생성을 위한 5개 테이블 데이터 조회"""
        try:
            migration_results = {}
            total_insert_count = 0

            # 1. tb_cdrsend_base_info
            query1 = f"SELECT * FROM kmznmst.tb_cdrsend_base_info WHERE ne_id = '{source_ne_id}' AND exp_dt > now()"
            insert_statements_1 = SQLService.execute_and_generate_inserts(query1, "kmznmst", "tb_cdrsend_base_info")
            migration_results["tb_cdrsend_base_info"] = {"count": len(insert_statements_1), "statements": insert_statements_1}
            total_insert_count += len(insert_statements_1)

            # 2. tb_cdrcoll_base_info
            query2 = f"SELECT * FROM kmznmst.tb_cdrcoll_base_info WHERE ne_id = '{source_ne_id}' AND exp_dt > now()"
            insert_statements_2 = SQLService.execute_and_generate_inserts(query2, "kmznmst", "tb_cdrcoll_base_info")
            migration_results["tb_cdrcoll_base_info"] = {"count": len(insert_statements_2), "statements": insert_statements_2}
            total_insert_count += len(insert_statements_2)

            # 3. tb_cdrcoll_srvr_info
            query3 = f"SELECT * FROM kmznmst.tb_cdrcoll_srvr_info WHERE srvr_id = '{source_ne_id}' AND exp_dt > now()"
            insert_statements_3 = SQLService.execute_and_generate_inserts(query3, "kmznmst", "tb_cdrcoll_srvr_info")
            migration_results["tb_cdrcoll_srvr_info"] = {"count": len(insert_statements_3), "statements": insert_statements_3}
            total_insert_count += len(insert_statements_3)

            # 4. tb_wflow_info (연관된 workflow ID 기반)
            wflow_query = f"SELECT DISTINCT wflow_inst_id FROM kmznmst.tb_cdrsend_base_info WHERE ne_id = '{source_ne_id}' AND exp_dt > now()"
            wflow_rows, _ = DatabaseService.execute_query(wflow_query)
            
            wflow_ids = []
            for row in wflow_rows:
                if row[0] and (row[0].startswith('C') or row[0].startswith('P')):
                    wflow_ids.append(row[0])

            insert_statements_4 = []
            for wflow_id in wflow_ids:
                query4 = f"SELECT * FROM kmznmst.tb_wflow_info WHERE wflow_inst_id = '{wflow_id}' AND exp_dt > now()"
                statements = SQLService.execute_and_generate_inserts(query4, "kmznmst", "tb_wflow_info")
                insert_statements_4.extend(statements)

            migration_results["tb_wflow_info"] = {"count": len(insert_statements_4), "statements": insert_statements_4}
            total_insert_count += len(insert_statements_4)

            # 5. tb_file_fmt_info (연관된 format ID 기반)
            fmt_query = f"SELECT origin_fmt_id, cdr_change_fmt_id FROM kmznmst.tb_cdrsend_base_info WHERE ne_id = '{source_ne_id}' AND exp_dt > now()"
            fmt_rows, _ = DatabaseService.execute_query(fmt_query)
            
            fmt_ids = []
            for row in fmt_rows:
                if row[0]:  # origin_fmt_id
                    fmt_ids.append(row[0])
                if row[1]:  # cdr_change_fmt_id
                    fmt_ids.append(row[1])
            
            fmt_ids = list(set(fmt_ids))  # 중복 제거

            insert_statements_5 = []
            for fmt_id in fmt_ids:
                query5 = f"SELECT * FROM kmznmst.tb_file_fmt_info WHERE cdr_file_fmt_id = '{fmt_id}'"
                statements = SQLService.execute_and_generate_inserts(query5, "kmznmst", "tb_file_fmt_info")
                insert_statements_5.extend(statements)

            migration_results["tb_file_fmt_info"] = {"count": len(insert_statements_5), "statements": insert_statements_5}
            total_insert_count += len(insert_statements_5)

            logger.info(f"AI SQL 생성용 데이터 조회 완료: 총 {total_insert_count}개 INSERT문")
            return migration_results, total_insert_count

        except Exception as e:
            logger.error(f"AI SQL 생성용 데이터 조회 중 오류: {e}")
            raise