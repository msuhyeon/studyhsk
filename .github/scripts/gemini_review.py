import os
import sys
import google.generativeai as genai
import requests
import json

# 비용 절감 설정
MAX_FILE_SIZE = 50000  # 50KB 제한
MIN_CONTENT_LENGTH = 100  # 100자 미만 스킵

# Gemini 설정
genai.configure(api_key=os.environ['GEMINI_API_KEY'])
SYSTEM_INSTRUCTION = """당신은 시니어 개발자입니다.

다음 형식으로 리뷰해주세요:

### 1. 코드 품질 및 가독성:
- 중요한 개선사항만 간단히 (없으면 "전반적으로 깔끔합니다")

### 2. 잠재적인 버그나 보안 이슈:
- 치명적 이슈만 (없으면 "이슈 없음")

### 3. 성능 개선 사항:
- 중요한 것만 (없으면 "이슈 없음")

### 4. 베스트 프랙티스 준수 여부:
- 핵심 사항만 (없으면 "준수함")

규칙:
- 사소한 스타일/네이밍/주석은 언급 안 함
- 각 섹션 2-3줄 이내로 간결하게
- 한국어로 작성"""

model = genai.GenerativeModel(
    model_name='gemini-2.0-flash-lite',
    system_instruction=SYSTEM_INSTRUCTION,
    generation_config={
        "temperature": 0.1,
        "max_output_tokens": 300
    }
)

def get_file_content(file_path):
    """파일 내용 읽기"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        file_size = len(content.encode('utf-8'))
        
        if file_size > MAX_FILE_SIZE:
            return {
                'content': content[:MAX_FILE_SIZE],
                'truncated': True,
                'size': file_size
            }
        
        return {
            'content': content,
            'truncated': False,
            'size': file_size
        }
    except Exception as e:
        return None

def review_code(file_path, file_data):
    """코드 리뷰"""
    content = file_data['content']
    
    if file_data['truncated']:
        prompt = f"파일: {file_path} (일부만 표시)\n\n{content}"
    else:
        prompt = f"파일: {file_path}\n\n{content}"
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return None

def post_review_comment(review_text, file_path):
    """GitHub PR에 댓글 작성"""
    try:
        github_token = os.environ['GITHUB_TOKEN']
        repo = os.environ['GITHUB_REPOSITORY']
        pr_number = os.environ.get('PR_NUMBER')
        
        if not pr_number:
            event_path = os.environ.get('GITHUB_EVENT_PATH')
            if event_path:
                with open(event_path, 'r') as f:
                    event = json.load(f)
                    pr_number = event['pull_request']['number']
        
        if not pr_number:
            return False
        
        url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
        headers = {
            'Authorization': f'token {github_token}',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Gemini-Code-Review-Bot'
        }
        
        comment_body = f"""## 🔍 AI 리뷰: `{file_path}`

{review_text}

---
*AI 리뷰 - 참고용*"""
        
        data = {'body': comment_body}
        response = requests.post(url, headers=headers, json=data)
        
        return response.status_code == 201
            
    except Exception as e:
        return False

def main():
    changed_files = sys.argv[1].split() if len(sys.argv) > 1 else []
    
    code_extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.sql', '.json', '.css', '.scss']
    code_files = [f for f in changed_files if any(f.endswith(ext) for ext in code_extensions)]
    
    if not code_files:
        return
    
    for file_path in code_files:
        file_data = get_file_content(file_path)
        
        if not file_data or file_data['size'] < MIN_CONTENT_LENGTH:
            continue
        
        review = review_code(file_path, file_data)
        
        if review:
            post_review_comment(review, file_path)

if __name__ == "__main__":
    main()