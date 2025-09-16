#!/usr/bin/env python3
"""
파일명 인코딩 복구 스크립트
이중 인코딩으로 깨진 한글 파일명을 복구합니다.
"""

import sqlite3
import sys
from pathlib import Path

# 프로젝트 루트 경로 설정
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def fix_double_encoded_filename(corrupted_name):
    """
    이중 인코딩된 파일명을 복구
    예: 'ì ììêµ¬ì' -> '정책연구서'
    """
    if not corrupted_name:
        return corrupted_name
    
    try:
        # UTF-8로 인코딩된 바이트가 Latin-1로 해석된 경우를 복구
        # 잘못된 UTF-8 문자열을 바이트로 변환 후 올바르게 디코딩
        fixed_name = corrupted_name.encode('latin-1', errors='ignore').decode('utf-8', errors='ignore')
        return fixed_name
    except (UnicodeDecodeError, UnicodeEncodeError):
        try:
            # 또 다른 방법: UTF-8 바이트가 잘못 해석된 경우
            fixed_name = corrupted_name.encode('raw_unicode_escape').decode('utf-8', errors='ignore')
            return fixed_name
        except:
            # 복구 실패시 원본 반환
            return corrupted_name

def is_corrupted(filename):
    """
    파일명이 깨졌는지 확인
    UTF-8 문자가 Latin-1로 잘못 해석된 패턴을 감지
    """
    if not filename:
        return False
    
    # 일반적인 깨진 한글 패턴
    corrupted_patterns = [
        'Ã¬', 'Ã­', 'Ã©', 'Ã¨', 'Ã«', 'Ãª',  # UTF-8 한글의 시작 바이트가 Latin-1로 표현된 패턴
        'Â', '¬', '­', '¯',  # 일반적인 깨진 문자
        'ì', 'í', 'ê', 'ë',  # 깨진 한글 자음/모음
    ]
    
    for pattern in corrupted_patterns:
        if pattern in filename:
            return True
    
    return False

def fix_database_filenames():
    """
    데이터베이스의 깨진 파일명을 복구
    """
    # 데이터베이스 연결
    db_path = project_root / "data_portal.db"
    if not db_path.exists():
        print(f"데이터베이스 파일을 찾을 수 없습니다: {db_path}")
        return
    
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # 백업 테이블 생성 (안전을 위해)
    print("백업 테이블 생성 중...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS applications_backup AS 
        SELECT * FROM applications
    """)
    conn.commit()
    
    # 모든 파일명 조회
    cursor.execute("""
        SELECT id, irb_document_original_name, research_plan_original_name 
        FROM applications 
        WHERE irb_document_original_name IS NOT NULL 
           OR research_plan_original_name IS NOT NULL
    """)
    
    rows = cursor.fetchall()
    fixed_count = 0
    error_count = 0
    
    print(f"총 {len(rows)}개의 레코드를 검사합니다...")
    print("-" * 60)
    
    for row_id, irb_name, research_name in rows:
        changes_made = False
        new_irb_name = irb_name
        new_research_name = research_name
        
        # IRB 문서 파일명 복구
        if irb_name and is_corrupted(irb_name):
            fixed_name = fix_double_encoded_filename(irb_name)
            if fixed_name != irb_name:
                print(f"[IRB 문서 복구]")
                print(f"  ID: {row_id}")
                print(f"  원본: {irb_name[:50]}...")
                print(f"  복구: {fixed_name[:50]}...")
                new_irb_name = fixed_name
                changes_made = True
        
        # 연구계획서 파일명 복구
        if research_name and is_corrupted(research_name):
            fixed_name = fix_double_encoded_filename(research_name)
            if fixed_name != research_name:
                print(f"[연구계획서 복구]")
                print(f"  ID: {row_id}")
                print(f"  원본: {research_name[:50]}...")
                print(f"  복구: {fixed_name[:50]}...")
                new_research_name = fixed_name
                changes_made = True
        
        # 변경사항이 있으면 업데이트
        if changes_made:
            try:
                cursor.execute("""
                    UPDATE applications 
                    SET irb_document_original_name = ?,
                        research_plan_original_name = ?
                    WHERE id = ?
                """, (new_irb_name, new_research_name, row_id))
                fixed_count += 1
                print(f"  ✓ 업데이트 완료")
                print("-" * 60)
            except Exception as e:
                error_count += 1
                print(f"  ✗ 업데이트 실패: {e}")
                print("-" * 60)
    
    # 커밋
    if fixed_count > 0:
        conn.commit()
        print(f"\n복구 완료!")
        print(f"  - 복구된 레코드: {fixed_count}개")
        print(f"  - 오류 발생: {error_count}개")
        print(f"  - 백업 테이블: applications_backup")
    else:
        print("\n복구할 파일명이 없습니다.")
    
    # 복구 결과 샘플 출력
    print("\n[복구 결과 샘플]")
    cursor.execute("""
        SELECT id, irb_document_original_name, research_plan_original_name 
        FROM applications 
        WHERE irb_document_original_name IS NOT NULL 
           OR research_plan_original_name IS NOT NULL
        LIMIT 5
    """)
    
    for row in cursor.fetchall():
        print(f"ID: {row[0]}")
        if row[1]:
            print(f"  IRB: {row[1]}")
        if row[2]:
            print(f"  연구계획서: {row[2]}")
    
    conn.close()

def main():
    """
    메인 실행 함수
    """
    print("=" * 60)
    print("파일명 인코딩 복구 스크립트")
    print("=" * 60)
    
    # 사용자 확인
    response = input("\n데이터베이스의 깨진 파일명을 복구하시겠습니까? (y/n): ")
    if response.lower() != 'y':
        print("작업을 취소했습니다.")
        return
    
    print("\n복구 작업을 시작합니다...")
    fix_database_filenames()
    
    print("\n작업이 완료되었습니다.")
    print("문제가 발생한 경우 applications_backup 테이블에서 원본 데이터를 복구할 수 있습니다.")

if __name__ == "__main__":
    main()