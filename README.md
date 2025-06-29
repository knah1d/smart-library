# Smart Library System

A microservices-based library management system built with Node.js, Express, MongoDB, and React.

## Features

-   User Management (students/faculty)
-   Book Management
-   Loan Management
-   Statistics and Reporting
-   Containerized microservices architecture

## Prerequisites

-   Docker and Docker Compose
-   Node.js (v14 or higher) - for local development only
-   MongoDB (v4.4 or higher) - for local development only

## Quick Start with Docker

The easiest way to run the entire system is with Docker Compose:

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Visit:

-   Frontend: http://localhost/client
-   API Endpoints:
    -   Users: http://localhost/api/users
    -   Books: http://localhost/api/books
    -   Loans: http://localhost/api/loans
    -   Stats: http://localhost/api/stats

## API Documentation

### User Endpoints

-   `POST /api/users` - Create a new user
-   `GET /api/users/:id` - Get user by ID
-   `PUT /api/users/:id` - Update user

### Book Endpoints

-   `POST /api/books` - Add a new book
-   `GET /api/books` - List all books (with search)
-   `GET /api/books/:id` - Get book by ID
-   `PUT /api/books/:id` - Update book
-   `DELETE /api/books/:id` - Delete book

### Loan Endpoints

-   `POST /api/loans` - Issue a book
-   `POST /api/returns` - Return a book
-   `GET /api/loans/user/:userId` - Get user's loan history
-   `GET /api/loans/overdue` - List overdue loans
-   `PUT /api/loans/:id/extend` - Extend loan due date

### Statistics Endpoints

-   `GET /api/stats/books/popular` - Get popular books
-   `GET /api/stats/users/active` - Get active users
-   `GET /api/stats/overview` - Get system overview

## Data Models

### User

-   name (String)
-   email (String)
-   role (String: 'student' or 'faculty')

### Book

-   title (String)
-   author (String)
-   isbn (String)
-   copies (Number)
-   availableCopies (Number)

### Loan

-   user (ObjectId)
-   book (ObjectId)
-   issueDate (Date)
-   dueDate (Date)
-   returnDate (Date)
-   status (String: 'ACTIVE', 'RETURNED', 'OVERDUE')
-   extensionsCount (Number)

## Error Handling

The API uses standard HTTP status codes:

-   200: Success
-   201: Created
-   400: Bad Request
-   404: Not Found
-   500: Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
