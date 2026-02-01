start-process powershell -argumentList "-Command", "cd backend; bun .\server.ts"
start-process powershell -argumentList "-Command", "cd frontend; bun run start"
