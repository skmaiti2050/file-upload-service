# Secure File Upload & Metadata Processing Microservice

A NestJS-based backend microservice that handles authenticated file uploads, stores associated metadata in a PostgreSQL database, and processes those files asynchronously using BullMQ.

## Features

- User authentication with JWT
- Secure file uploads with metadata
- Asynchronous file processing with BullMQ
- File status tracking
- User-specific upload rate limiting, file access control
- Pagination for file listing
- Error handling and retry logic for background jobs

## Tech Stack

- Node.js (>=18)
- NestJS (Backend framework)
- PostgreSQL (Database)
- TypeORM (ORM)
- JWT (Authentication)
- BullMQ (Background job processing)
- Multer (File upload handling)
- Redis (Required for BullMQ)

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Redis

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd file-upload-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the provided `.env.example` file to `.env` and adjust the values according to your environment:

```bash
cp .env.example .env
```

### 4. Start PostgreSQL and Redis

Make sure PostgreSQL and Redis are running on your machine or update the connection details in the `.env` file.

### 5. Run database migrations

```bash
npm run migration:run
```

### 6. Run the application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

### Authentication

#### Login
- **URL**: POST /api/auth/login
- **Body**:
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5...",
    "user": {
      "id": 1,
      "email": "test@example.com",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
  ```

### User Management

#### Create User
- **URL**: POST /api/users
- **Body**:
  ```json
  {
    "email": "new@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "id": 2,
    "email": "new@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
  ```

#### Get Current User
- **URL**: GET /api/users/me
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "id": 1,
    "email": "test@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
  ```

### File Operations

#### Upload File
- **URL**: POST /api/files/upload
- **Headers**: Authorization: Bearer {token}
- **Body**: FormData with:
  - file: (binary file)
  - title: (optional) File title
  - description: (optional) File description
- **Response**:
  ```json
  {
    "id": 1,
    "userId": 1,
    "originalFilename": "example.txt",
    "storagePath": "uploads/12345-example.txt",
    "title": "My Document",
    "description": "An example document",
    "status": "uploaded",
    "extractedData": null,
    "uploadedAt": "2025-01-01T00:00:00.000Z"
  }
  ```

#### Get File by ID
- **URL**: GET /api/files/{id}
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "id": 1,
    "userId": 1,
    "originalFilename": "example.txt",
    "storagePath": "uploads/12345-example.txt",
    "title": "My Document",
    "description": "An example document",
    "status": "processed",
    "extractedData": "{\"hash\":\"abc123...\",\"size\":1024,\"processedAt\":\"2025-01-01T00:00:10.000Z\"}",
    "uploadedAt": "2025-01-01T00:00:00.000Z"
  }
  ```

#### List User Files
- **URL**: GET /api/files?page=1&limit=10
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "userId": 1,
        "originalFilename": "example.txt",
        "storagePath": "uploads/12345-example.txt",
        "title": "My Document",
        "description": "An example document",
        "status": "processed",
        "extractedData": "{\"hash\":\"abc123...\",\"size\":1024,\"processedAt\":\"2025-01-01T00:00:10.000Z\"}",
        "uploadedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

### Health Check

#### Health Check Endpoint
- **URL**: GET /api/health
- **Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "environment": "development",
    "service": "file-upload-service"
  }
  ```

## Authentication Flow

1. User sends credentials to `/api/auth/login`
2. Server validates credentials and returns JWT token
3. Client includes JWT token in Authorization header for all subsequent requests
4. Server validates token and allows/denies access based on token validity and user permissions

## File Processing Flow

1. User uploads file via `/api/files/upload` with JWT token
2. Server stores file, creates metadata record with status "uploaded"
3. Server adds processing job to BullMQ queue
4. Background worker picks up job and updates status to "processing"
5. Worker processes file (calculates hash, extracts info, etc.)
6. Worker updates file status to "processed" or "failed" with extracted data
7. User can check file status via `/api/files/{id}` endpoint

## Design Choices

### Authentication
- Used JWT for stateless authentication, which is ideal for microservices
- Implemented user-specific file access control to ensure security

### File Storage
- Used Multer for handling multipart form data
- Stored files on local disk with unique filenames to prevent collisions
- Stored file metadata in database for efficient querying

### Background Processing
- Used BullMQ for reliable, Redis-based job queuing
- Implemented retry logic for failed jobs
- Added job status tracking for transparency

### Database Schema
- Created separate tables for users, files, and jobs
- Used proper foreign key constraints for data integrity
- Implemented soft typing with enums for status fields

## Known Limitations & Future Improvements

- **Local File Storage**: In a production environment, files should be stored in a dedicated object storage service like AWS S3
- **File Type Validation**: Add validation for allowed file types
- **Testing**: Add unit and integration tests

## cURL Examples

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Upload File
```bash
curl -X POST http://localhost:4000/api/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.txt" \
  -F "title=My Document" \
  -F "description=An example document"
```

### Get File Status
```bash
curl -X GET http://localhost:4000/api/files/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### List Files
```bash
curl -X GET "http://localhost:4000/api/files?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
