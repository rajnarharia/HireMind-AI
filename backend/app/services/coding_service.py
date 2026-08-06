import json
import tempfile
import subprocess
import sys
import os

def execute_code(language: str, code: str, test_cases: list) -> dict:
    """
    Executes code against a list of test cases locally using subprocess.
    Replaces the dead Piston API.
    """
    lang_key = language.lower()
    
    passed_cases = 0
    total_cases = len(test_cases)
    total_time = 0.0
    
    for idx, tc in enumerate(test_cases):
        input_data = str(tc.get("input", ""))
        expected = str(tc.get("expected", "")).strip()
        
        stdout = ""
        stderr = ""
        
        try:
            if lang_key == "python":
                with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode='w', encoding='utf-8') as f:
                    f.write(code)
                    tmp_name = f.name
                
                result = subprocess.run(
                    [sys.executable, tmp_name],
                    input=input_data,
                    text=True,
                    capture_output=True,
                    timeout=5
                )
                stdout = result.stdout.strip()
                stderr = result.stderr.strip()
                os.remove(tmp_name)
                
            elif lang_key == "javascript":
                with tempfile.NamedTemporaryFile(suffix=".js", delete=False, mode='w', encoding='utf-8') as f:
                    f.write(code)
                    tmp_name = f.name
                
                # Requires node to be in PATH
                result = subprocess.run(
                    ["node", tmp_name],
                    input=input_data,
                    text=True,
                    capture_output=True,
                    timeout=5
                )
                stdout = result.stdout.strip()
                stderr = result.stderr.strip()
                os.remove(tmp_name)
            else:
                stderr = f"Language {language} execution not supported locally."
                
            if stdout == expected or expected in stdout:
                passed_cases += 1
                
        except subprocess.TimeoutExpired:
            stderr = "Execution timed out."
            try: os.remove(tmp_name)
            except: pass
        except Exception as e:
            stderr = str(e)
            try: os.remove(tmp_name)
            except: pass
            
    return {
        "status": "passed" if passed_cases == total_cases and total_cases > 0 else "failed",
        "passed_cases": passed_cases,
        "total_cases": total_cases,
        "execution_time_ms": total_time,
        "memory_kb": 1024.0
    }

