#!/bin/sh

echo "🚀 Starting Simple Menu Backend..."

# Run database migrations
echo "🔧 Running database migrations..."
npx prisma migrate deploy

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "⚠️  Migration failed, attempting to create and migrate..."
    npx prisma db push --force-reset
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Start the application
echo "🚀 Starting application..."
npm start
