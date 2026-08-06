import fitz
from backend.app.core.ai_config import client, MODEL_NAME


def extract_text(pdf_path: str):
    document = fitz.open(pdf_path)

    text = ""

    for page in document:
        text += page.get_text()

    document.close()

    return text


def analyze_resume(pdf_path: str):
    resume_text = extract_text(pdf_path)

    prompt = f"""
You are an expert AI technical recruiter.

Analyze the following resume.

Return your answer in this format:

Resume Score: xx/100

Technical Skills:
- ...

Soft Skills:
- ...

Strengths:
- ...

Weaknesses:
- ...

Missing Skills:
- ...

Improvement Suggestions:
- ...

Resume:

{resume_text}
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
    )

    return response.choices[0].message.content