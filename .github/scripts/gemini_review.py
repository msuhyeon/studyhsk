import os
import sys
import google.generativeai as genai
import requests
import json

# Gemini 설정
genai.configure(api_key=os.environ['GEMINI_API_KEY'])
model = genai.GenerativeModel('gemini-1.5-flash')

def get_file_diff(file_path):
    """파일의 변경사항을 가져옵니다"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"파일 읽기 실패 {file_path}: {str(e)}")
        return None

def review_code(file_path, content):
    """Gemini로 코드를 리뷰합니다"""
    prompt = f"""
다음 파일의 코드를 리뷰해주세요: {file_path}

코드:
{content}

다음 관점에서 리뷰해주세요:
1. 코드 품질 및 가독성
2. 잠재적인 버그나 보안 이슈  
3. 성능 개선 사항
4. 베스트 프랙티스 준수 여부

한국어로 간결하고 건설적인 피드백을 제공해주세요.
"""
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API 오류: {str(e)}")
        return f"리뷰 생성 중 오류가 발생했습니다: {str(e)}"

def post_review_comment(review_text, file_path):
    """GitHub PR에 리뷰 코멘트를 작성합니다"""
    try:
        github_token = os.environ['GITHUB_TOKEN']
        repo = os.environ['GITHUB_REPOSITORY']
        
        # 환경변수에서 직접 PR 번호 가져오기 (워크플로우에서 설정해야 함)
        pr_number = os.environ.get('PR_NUMBER')
        
        if not pr_number:
            # GITHUB_EVENT_PATH에서 가져오기 (기존 방식)
            event_path = os.environ.get('GITHUB_EVENT_PATH')
            if event_path:
                with open(event_path, 'r') as f:
                    event = json.load(f)
                    pr_number = event['pull_request']['number']
        
        if not pr_number:
            print("❌ PR 번호를 찾을 수 없습니다")
            return False
        
        url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
        headers = {
            'Authorization': f'token {github_token}',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Gemini-Code-Review-Bot'
        }
        
        comment_body = f"""## 🤖 Gemini AI 코드리뷰 - `{file_path}`

{review_text}

---
*AI가 생성한 리뷰이므로 참고용으로만 사용해주세요.*
"""
        
        data = {'body': comment_body}
        
        print(f"GitHub API 호출: {url}")
        print(f"PR 번호: {pr_number}")
        
        response = requests.post(url, headers=headers, json=data)
        
        print(f"GitHub API 응답 코드: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ 댓글 작성 성공!")
            return True
        else:
            print(f"❌ 댓글 작성 실패: {response.status_code}")
            print(f"응답 내용: {response.text}")
            return False
            
    except Exception as e:
        print(f"댓글 작성 중 오류: {str(e)}")
        return False

def main():
    print("=== Gemini Code Review 시작 ===")
    
    changed_files = sys.argv[1].split() if len(sys.argv) > 1 else []
    print(f"변경된 파일들: {changed_files}")
    
    # 코드 파일만 필터링 (확장자 기준)
    code_extensions = [
        '.js', '.jsx', '.ts', '.tsx',
        '.py',
        '.sql',
        '.json',
        '.css', '.scss'
    ]
    
    code_files = [f for f in changed_files if any(f.endswith(ext) for ext in code_extensions)]
    print(f"리뷰할 코드 파일들: {code_files}")
    
    if not code_files:
        print("리뷰할 코드 파일이 없습니다.")
        return
    
    success_count = 0
    for file_path in code_files:
        print(f"\n--- {file_path} 리뷰 중 ---")
        content = get_file_diff(file_path)
        
        if content and len(content.strip()) > 0:
            review = review_code(file_path, content)
            if post_review_comment(review, file_path):
                success_count += 1
                print(f"✅ {file_path} 리뷰 완료")
            else:
                print(f"❌ {file_path} 리뷰 실패")
        else:
            print(f"⚠️  {file_path} 파일을 읽을 수 없거나 비어있습니다")
    
    print(f"\n=== 리뷰 완료: {success_count}/{len(code_files)} 성공 ===")

if __name__ == "__main__":
    main()