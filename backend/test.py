from main import process_message
result = process_message.delay("Test message")
print(result.get())  # Should print the task result if successful
