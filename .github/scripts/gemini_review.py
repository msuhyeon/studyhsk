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
    except:
        return None

def review_code(file_path, content):
    """Gemini로 코드를 리뷰합니다"""
    prompt = f"""
다음 파일의 코드를 리뷰해주세요: {file_path}

코드: {content}

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
        return f"리뷰 생성 중 오류가 발생했습니다: {str(e)}"

def post_review_comment(review_text, file_path):
    """GitHub PR에 리뷰 코멘트를 작성합니다"""
    github_token = os.environ['GITHUB_TOKEN']
    repo = os.environ['GITHUB_REPOSITORY']
    pr_number = os.environ.get('GITHUB_EVENT_PATH')
    
    if pr_number:
        with open(pr_number, 'r') as f:
            event = json.load(f)
            pr_num = event['pull_request']['number']
        
        url = f"https://api.github.com/repos/{repo}/issues/{pr_num}/comments"
        headers = {
            'Authorization': f'token {github_token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        
        comment_body = f"""## 🤖 Gemini AI 코드리뷰 - `{file_path}`

{review_text}

---
*AI가 생성한 리뷰이므로 참고용으로만 사용해주세요.*
"""
        
        data = {'body': comment_body}
        requests.post(url, headers=headers, json=data)

def main():
    changed_files = sys.argv[1].split() if len(sys.argv) > 1 else []
    
    # 코드 파일만 필터링 (확장자 기준)
    code_extensions = ['.py', '.js', '.jsx', '.ts', '.tsx']
    code_files = [f for f in changed_files if any(f.endswith(ext) for ext in code_extensions)]
    
    for file_path in code_files:
        content = get_file_diff(file_path)
        if content and len(content.strip()) > 0:
            review = review_code(file_path, content)
            post_review_comment(review, file_path)
            print(f"✅ {file_path} 리뷰 완료")

if __name__ == "__main__":
    main()