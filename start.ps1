start-process powershell -argumentList "-NoExit", "-Command", "cd backend; bun .\server.ts"
start-process powershell -argumentList "-NoExit", "-Command", "cd frontend; bun run start"
