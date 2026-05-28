import requests
import uuid

url = 'http://127.0.0.1:8000/api/v1/materials/upload'
files = {'file': ('test.txt', 'hello world')}
data = {'subject_id': str(uuid.uuid4()), 'student_id': str(uuid.uuid4())}

try:
    response = requests.post(url, files=files, data=data)
    print(response.status_code)
    print(response.text)
except Exception as e:
    print("Error:", e)
