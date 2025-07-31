#!/bin/bash

echo "🚀 Vending Machine Database Setup"
echo "=================================="

# Check if DATABASE_URL is provided
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set your DATABASE_URL first:"
    echo "export DATABASE_URL='your-vercel-postgres-connection-string'"
    echo ""
    echo "You can find this in your Vercel dashboard:"
    echo "1. Go to your project dashboard"
    echo "2. Navigate to Storage → prisma-postgres-red-village"
    echo "3. Copy the connection string"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo "🔌 Connecting to database..."

# Run the setup script
node setup-database.js

echo ""
echo "🎉 Setup complete! Check the output above for any errors." 