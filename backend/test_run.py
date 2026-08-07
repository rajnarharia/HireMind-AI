import requests

url = "http://127.0.0.1:8000/api/coding/run"
# Note: we might need a bearer token to hit the endpoint. Let's just bypass auth in testing or use the function directly.
import sys
sys.path.append("C:/Users/welcome/OneDrive/Desktop/HireMind-AI/backend")
from app.services.coding_service import execute_run_code

print("Python:", execute_run_code("python", 'print("raj narharia")'))
print("Python2:", execute_run_code("python", 'a=10\nb=20\nprint(a+b)'))
print("JS:", execute_run_code("javascript", 'console.log("raj")'))
print("Java:", execute_run_code("java", 'class Main{\npublic static void main(String[] args){\nSystem.out.println("raj");\n}\n}'))
print("C++:", execute_run_code("c++", '#include<iostream>\nusing namespace std;\nint main(){\ncout<<"raj";\n}'))
