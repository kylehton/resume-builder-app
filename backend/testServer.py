import requests

print(requests.get("http://127.0.0.1:8000/").json())

passThis = {"message": "Hello"}

# Make the POST request
response = requests.post("http://127.0.0.1:8000/chat", json=passThis)

# Print the response
print(response.json())