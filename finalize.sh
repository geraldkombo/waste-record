#!/bin/bash
echo "Starting Finalization Pipeline..."

# 1. Install deps
npm install

# 2. Run Tests
echo "Running Unit Tests..."
npx vitest run
if [ $? -ne 0 ]; then
    echo "Tests Failed. Aborting."
    exit 1
fi

# 3. Production Build
echo "Building Production Bundle..."
npm run build

if [ $? -eq 0 ]; then
    echo "SUCCESS: Project Santiago-Livedlines is ready."
    exit 0
else
    echo "Build Failed. Check dist/ logs."
    exit 1
fi
