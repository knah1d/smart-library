# Smart Library System

A monolithic library management system built with Node.js, Express.js, and MongoDB.

## Features

- User Management (students/faculty)
- Book Management
- Loan Management
- Statistics and Reporting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-library-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/smart_library
NODE_ENV=development
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

### User Endpoints

- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Book Endpoints

- `POST /api/books` - Add a new book
- `GET /api/books` - List all books (with search)
- `GET /api/books/:id` - Get book by ID
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Loan Endpoints

- `POST /api/loans` - Issue a book
- `POST /api/returns` - Return a book
- `GET /api/loans/user/:userId` - Get user's loan history
- `GET /api/loans/overdue` - List overdue loans
- `PUT /api/loans/:id/extend` - Extend loan due date

### Statistics Endpoints

- `GET /api/stats/books/popular` - Get popular books
- `GET /api/stats/users/active` - Get active users
- `GET /api/stats/overview` - Get system overview

## Data Models

### User
- name (String)
- email (String)
- role (String: 'student' or 'faculty')

### Book
- title (String)
- author (String)
- isbn (String)
- copies (Number)
- availableCopies (Number)

### Loan
- user (ObjectId)
- book (ObjectId)
- issueDate (Date)
- dueDate (Date)
- returnDate (Date)
- status (String: 'ACTIVE', 'RETURNED', 'OVERDUE')
- extensionsCount (Number)

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 