# Authentication API

A secure RESTful API for user authentication and password management built with Node.js, Express, and MongoDB.

## Features

- User registration and login
- JWT-based authentication
- Password reset functionality
- Session management
- Token blacklisting
- Rate limiting
- CORS support
- MongoDB integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/your-database-name
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "your-password"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "your-password"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <your-jwt-token>
```

### Password Reset

#### Request Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
    "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
    "token": "reset-token-from-email",
    "newPassword": "your-new-password"
}
```

## Response Examples

### Successful Registration
```json
{
    "message": "User registered successfully",
    "user": {
        "id": "user-id",
        "email": "user@example.com"
    }
}
```

### Successful Login
```json
{
    "message": "Login successful",
    "token": "jwt-token",
    "user": {
        "id": "user-id",
        "email": "user@example.com"
    }
}
```

### Password Reset Request
```json
{
    "message": "Password reset email sent"
}
```

### Password Reset
```json
{
    "message": "Password reset successful"
}
```

## Error Responses

### 400 Bad Request
```json
{
    "message": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
    "message": "Invalid credentials"
}
```

### 404 Not Found
```json
{
    "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
    "message": "Error processing request"
}
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **JWT Authentication**: Secure token-based authentication
3. **Token Blacklisting**: Invalidated tokens are blacklisted
4. **Rate Limiting**: Prevents brute force attacks
5. **CORS Protection**: Configurable cross-origin resource sharing
6. **Environment Variables**: Sensitive data is stored in environment variables

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Development

### Project Structure
```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
└── server.js       # Application entry point
```

### Available Scripts

- `npm start`: Start the server in production mode
- `npm run dev`: Start the server in development mode with hot reload
- `npm test`: Run the test suite
- `npm run test:coverage`: Run tests with coverage report
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 