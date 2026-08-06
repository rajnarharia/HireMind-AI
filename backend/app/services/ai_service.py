import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# In production, use os.getenv("GROQ_API_KEY")
# For local dev without a set environment variable, this would fail if not provided.
client = Groq(api_key=os.getenv("GROQ_API_KEY", "gsk_placeholder_do_not_use_in_prod")) 

def extract_json(content: str):
    try:
        return json.loads(content.strip())
    except json.JSONDecodeError:
        pass
    match = re.search(r'```(?:json)?(.*?)```', content, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass
    start_dict = content.find('{')
    end_dict = content.rfind('}')
    start_list = content.find('[')
    end_list = content.rfind(']')
    
    if start_dict != -1 and end_dict != -1 and end_dict > start_dict and (start_list == -1 or start_dict < start_list):
        try: return json.loads(content[start_dict:end_dict+1])
        except: pass
    elif start_list != -1 and end_list != -1 and end_list > start_list:
        try: return json.loads(content[start_list:end_list+1])
        except: pass
        
    raise ValueError("Failed to parse JSON")

def analyze_resume(resume_text: str) -> dict:
    """Analyzes resume text using Groq's Llama-3.3-70B-Versatile."""
    
    prompt = f"""
    You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter.
    Analyze the following resume text and provide a structured JSON response evaluating the candidate.
    
    CRITICAL: YOU MUST RETURN ONLY VALID JSON. DO NOT INCLUDE ANY MARKDOWN BACKTICKS, EXPLANATIONS, OR ADDITIONAL TEXT.
    
    JSON Schema:
    {{
        "ats_score": (float, 0-100, how well it parses for ATS),
        "resume_score": (float, 0-100, overall candidate strength),
        "skills": [list of strings, extracted skills],
        "strengths": [list of strings, 3-5 key strengths],
        "weaknesses": [list of strings, 2-4 areas of concern],
        "missing_skills": [list of strings, recommended skills missing],
        "suggestions": [list of strings, actionable resume improvements],
        "summary": (string, 2-3 sentence executive summary of the candidate)
    }}
    
    Resume Text:
    {resume_text}
    """
    
    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2, # Low temperature for more deterministic JSON
        )
        
        content = response.choices[0].message.content
        return extract_json(content)
        
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        # Return a fallback safe structure in case of total failure
        return {
            "ats_score": 0,
            "resume_score": 0,
            "skills": [],
            "strengths": ["Failed to analyze"],
            "weaknesses": ["Failed to analyze"],
            "missing_skills": [],
            "suggestions": ["Please try uploading again later."],
            "summary": "AI Analysis failed due to an API error."
        }

def generate_interview_question(resume_context: dict, previous_qa: list, difficulty: str, category: str, target_role: str) -> dict:
    """Generates the next interview question based on resume and past performance."""
    
    prompt = f"""
    You are an expert Technical Interviewer hiring for a {target_role} role.
    Generate ONE targeted interview question for the candidate based on their resume and interview history.
    
    CRITICAL: YOU MUST RETURN ONLY VALID JSON. NO MARKDOWN.
    
    Context:
    - Target Role: {target_role}
    - Requested Category: {category} (e.g. technical, behavioral, project, problem_solving)
    - Desired Difficulty: {difficulty} (easy, medium, hard)
    
    Resume Summary: {resume_context.get('summary', '')}
    Resume Skills: {', '.join(resume_context.get('skills', []))}
    
    Previous Interview Questions and Answers (do not repeat these):
    {json.dumps(previous_qa, indent=2)}
    
    JSON Schema:
    {{
        "question_text": (string, the interview question),
        "skill_tag": (string or null, specific skill being tested, e.g. "React" or "Leadership")
    }}
    """
    
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.4,
        )
        content = response.choices[0].message.content
        return extract_json(content)
    except Exception as e:
        print(f"Error generating question: {e}")
        return {
            "question_text": "Could you tell me more about your background and experience?",
            "skill_tag": "General"
        }

def evaluate_interview_answer(question_text: str, answer_text: str, target_role: str, difficulty: str) -> dict:
    """Evaluates an interview answer using Groq."""
    
    prompt = f"""
    You are an expert Technical Interviewer for a {target_role} role.
    Evaluate the candidate's answer to the following interview question.
    The question difficulty was {difficulty}.
    
    CRITICAL: YOU MUST RETURN ONLY VALID JSON. NO MARKDOWN.
    
    Question: {question_text}
    Candidate's Answer: {answer_text}
    
    JSON Schema:
    {{
        "score": (float, 0-100, objective score of the answer),
        "strengths": [list of strings, 1-3 strong points],
        "weaknesses": [list of strings, 1-3 weak points or missing details],
        "suggestions": [list of strings, actionable feedback to improve],
        "ideal_answer": (string, how an ideal candidate should have answered)
    }}
    """
    
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
        )
        content = response.choices[0].message.content
        return extract_json(content)
    except Exception as e:
        print(f"Error evaluating answer: {e}")
        return {
            "score": 50.0,
            "strengths": ["Answer recorded"],
            "weaknesses": ["AI evaluation failed temporarily"],
            "suggestions": ["N/A"],
            "ideal_answer": "Evaluation service unavailable."
        }

def generate_coding_question(resume_context: dict, target_role: str, difficulty: str) -> dict:
    """Generates a coding problem based on resume context and difficulty."""
    prompt = f"""
    You are an expert LeetCode/HackerRank style technical interviewer.
    Generate a coding problem for a {target_role} candidate based on their resume skills: {', '.join(resume_context.get('skills', []))}.
    Difficulty: {difficulty}
    
    CRITICAL: YOU MUST RETURN ONLY VALID JSON. NO MARKDOWN.
    
    JSON Schema:
    {{
        "title": "Problem Title",
        "problem_statement": "Detailed problem description",
        "topic_tag": "e.g. Arrays, Strings, Hash Maps",
        "difficulty": "{difficulty}",
        "constraints": ["Constraint 1", "Constraint 2"],
        "examples": [
            {{"input": "str", "output": "str", "explanation": "str"}}
        ],
        "visible_test_cases": [
            {{"input": "str", "expected": "str"}}
        ],
        "hidden_test_cases": [
            {{"input": "str", "expected": "str"}},
            {{"input": "str", "expected": "str"}},
            {{"input": "str", "expected": "str"}},
            {{"input": "str", "expected": "str"}},
            {{"input": "str", "expected": "str"}}
        ],
        "hints": ["Hint 1", "Hint 2"]
    }}
    """
    
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
        )
        content = response.choices[0].message.content
        return extract_json(content)
    except Exception as e:
        print(f"Error generating coding question: {e}")
        return {
            "title": "Two Sum",
            "problem_statement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "topic_tag": "Arrays",
            "difficulty": "easy",
            "constraints": ["2 <= nums.length <= 10^4"],
            "examples": [{"input": "[2,7,11,15], target=9", "output": "[0,1]", "explanation": "nums[0]+nums[1]==9"}],
            "visible_test_cases": [{"input": "[2,7,11,15], target=9", "expected": "[0,1]"}],
            "hidden_test_cases": [{"input": "[3,2,4], target=6", "expected": "[1,2]"}],
            "hints": ["Use a hash map."]
        }

def evaluate_code_quality(code: str, language: str, problem_statement: str) -> dict:
    """Evaluates the submitted code for quality, complexity, and correctness."""
    prompt = f"""
    You are an expert Senior Staff Software Engineer reviewing code submitted for an interview.
    Review the following {language} code for the given problem.
    
    Problem: {problem_statement}
    Code:
    {code}
    
    CRITICAL: YOU MUST RETURN ONLY VALID JSON. NO MARKDOWN.
    
    JSON Schema:
    {{
        "score": (float, 0-100, code quality score),
        "time_complexity": "O(...)",
        "space_complexity": "O(...)",
        "correctness": "Brief summary of correctness",
        "code_quality": "Brief summary of code style/readability",
        "optimization_suggestions": ["Suggestion 1", "Suggestion 2"],
        "security_issues": ["Issue 1"] (or empty list),
        "alternative_solution": "Description of a better approach if one exists"
    }}
    """
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
        )
        content = response.choices[0].message.content
        return extract_json(content)
    except Exception as e:
        print(f"Error reviewing code: {e}")
        return {
            "score": 50.0,
            "time_complexity": "O(N)",
            "space_complexity": "O(N)",
            "correctness": "Unable to evaluate automatically.",
            "code_quality": "Review service unavailable.",
            "optimization_suggestions": [],
            "security_issues": [],
            "alternative_solution": "N/A"
        }

def analyze_job_description(raw_text: str) -> dict:
    prompt = f"""
    You are an expert HR Talent Acquisition Specialist.
    Analyze the following Job Description and extract key information into a structured format.
    
    Job Description:
    {raw_text}
    
    CRITICAL: YOU MUST RETURN ONLY VALID JSON. NO MARKDOWN.
    
    JSON Schema:
    {{
        "required_skills": ["Skill 1", "Skill 2"],
        "experience": "Minimum X years...",
        "education": "Bachelor's...",
        "responsibilities": ["Resp 1"],
        "soft_skills": ["Soft Skill 1"]
    }}
    """
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
        )
        content = response.choices[0].message.content
        return extract_json(content)
    except Exception as e:
        print(f"Error parsing JD: {e}")
        return {
            "required_skills": [], "experience": "Unknown", "education": "Unknown",
            "responsibilities": [], "soft_skills": []
        }

def generate_hiring_report(resume_data: dict, interview_data: dict, coding_data: dict, jd_data: dict) -> dict:
    prompt = f"""
    You are an elite Principal AI Technical Recruiter.
    Compare the candidate's holistic profile against the Job Description and generate a comprehensive Hiring Report and Skill Gap Analysis.
    
    Candidate Data:
    Resume: {resume_data}
    Interview: {interview_data}
    Coding: {coding_data}
    
    Job Description: {jd_data}
    
    CRITICAL: YOU MUST RETURN ONLY VALID JSON. NO MARKDOWN.
    
    JSON Schema:
    {{
        "skill_gap": {{
            "skill_match_percent": (float 0-100),
            "technical_match_percent": (float 0-100),
            "soft_skill_match_percent": (float 0-100),
            "experience_match_percent": (float 0-100),
            "education_match_percent": (float 0-100),
            "matching_skills": ["Skill 1"],
            "missing_skills": ["Skill 1"],
            "weak_skills": ["Skill 1"],
            "strong_skills": ["Skill 1"],
            "recommended_skills": ["Skill 1"]
        }},
        "report": {{
            "resume_score": (float 0-100),
            "interview_score": (float 0-100),
            "coding_score": (float 0-100),
            "overall_score": (float 0-100),
            "strengths": ["Strength 1"],
            "weaknesses": ["Weakness 1"],
            "risks": ["Risk 1"],
            "positive_observations": ["Observation 1"],
            "improvement_suggestions": ["Suggestion 1"],
            "recommended_roles": ["Role 1"],
            "salary_readiness": "Entry / Mid / Senior",
            "hiring_recommendation": "Hire / Maybe / Reject",
            "confidence_level": "High / Medium / Low"
        }}
    }}
    """
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
        )
        content = response.choices[0].message.content
        return extract_json(content)
    except Exception as e:
        print(f"Error generating report: {e}")
        return {
            "skill_gap": {
                "skill_match_percent": 0.0, "technical_match_percent": 0.0, "soft_skill_match_percent": 0.0,
                "experience_match_percent": 0.0, "education_match_percent": 0.0,
                "matching_skills": [], "missing_skills": [], "weak_skills": [], "strong_skills": [], "recommended_skills": []
            },
            "report": {
                "resume_score": 0.0, "interview_score": 0.0, "coding_score": 0.0, "overall_score": 0.0,
                "strengths": [], "weaknesses": [], "risks": [], "positive_observations": [],
                "improvement_suggestions": [], "recommended_roles": [],
            "salary_readiness": "Unknown", "hiring_recommendation": "Reject", "confidence_level": "Low"
            }
        }

def generate_learning_roadmap(report_data: dict, gap_data: dict) -> list:
    """Generates a 12-week personalized learning roadmap based on skill gaps."""
    prompt = f"""
    You are an expert Career Coach and Principal Engineer.
    Based on the candidate's hiring report and skill gap analysis, generate a strict 12-week learning roadmap to help them master the missing skills and improve weaknesses.
    
    Report Data: {report_data}
    Gap Data: {gap_data}
    
    CRITICAL: YOU MUST RETURN ONLY VALID JSON. NO MARKDOWN.
    
    JSON Schema MUST BE EXACTLY a list of 12 objects representing weeks:
    [
        {{
            "week_number": 1,
            "topics": "Topic 1, Topic 2",
            "mini_project": "Description of mini project",
            "tasks": [
                {{
                    "title": "Task 1",
                    "resource_link": "URL or search term",
                    "resource_type": "Video/Article/Practice"
                }}
            ]
        }}
    ]
    """
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
        )
        content = response.choices[0].message.content
        return extract_json(content)
    except Exception as e:
        print(f"Error generating roadmap: {e}")
        return []
