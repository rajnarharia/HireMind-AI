import requests

PISTON_API_URL = "https://emkc.org/api/v2/piston/execute"

def get_piston_lang(language: str) -> tuple:
    lang = language.lower()
    if lang == "python": return "python", "3.10.0"
    if lang == "javascript" or lang == "js": return "javascript", "18.15.0"
    if lang == "java": return "java", "15.0.2"
    if lang == "cpp" or lang == "c++": return "c++", "10.2.0"
    return lang, "*"

def execute_run_code(language: str, code: str) -> dict:
    lang_key, lang_ver = get_piston_lang(language)
    payload = {
        "language": lang_key,
        "version": lang_ver,
        "files": [{"content": code}]
    }
    response = requests.post(PISTON_API_URL, json=payload, timeout=10)
    if response.status_code == 200:
        res_data = response.json()
        compile_res = res_data.get("compile", {})
        run_res = res_data.get("run", {})
        compile_err = compile_res.get("stderr", "").strip() if compile_res else ""
        run_err = run_res.get("stderr", "").strip() if run_res else ""
        stderr = compile_err if compile_err else run_err
        stdout = run_res.get("stdout", "").strip() if run_res else ""
        success = run_res.get("code", 1) == 0 and not stderr
        return {"stdout": stdout, "stderr": stderr, "success": success}
    return {"error": response.text}

print("Python:", execute_run_code("python", 'print("raj narharia")'))
print("Python2:", execute_run_code("python", 'a=10\nb=20\nprint(a+b)'))
print("JS:", execute_run_code("javascript", 'console.log("raj")'))
print("Java:", execute_run_code("java", 'class Main{\npublic static void main(String[] args){\nSystem.out.println("raj");\n}\n}'))
print("C++:", execute_run_code("c++", '#include<iostream>\nusing namespace std;\nint main(){\ncout<<"raj";\n}'))
