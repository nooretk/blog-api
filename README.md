# Blog API

A robust NestJS-based blog API with PostgreSQL, JWT authentication with refresh tokens, and comprehensive Role-Based Access Control (RBAC).

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-Based Access Control (RBAC) system
  - Permission-based authorization with decorators
  - Secure password hashing with bcrypt

- **Blog Management**
  - Create, read, update, and delete posts
  - Post visibility controls (public, private)
  - User profile management

- **Database & ORM**
  - PostgreSQL database with TypeORM
  - Database migrations for version control
  - Automated seeding for roles and admin user

- **API Documentation**
  - Swagger/OpenAPI integration
  - JWT Bearer authentication in docs
  - Comprehensive endpoint documentation

- **Security & Validation**
  - Global validation pipes with class-validator
  - Data transformation and serialization
  - Error handling with custom utilities

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Password Hashing**: bcrypt

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nooretk/blog-api
cd blog-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=blog_api

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 4. Database Setup

```bash
# Run database migrations
npm run m:run

# Seed the database with initial data (roles, permissions, admin user)
npm run start:dev
# The seeding will run automatically on first startup
```

### 5. Start the application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api
```

The documentation includes:

- All available endpoints
- Request/response schemas
- Authentication requirements
- Interactive API testing

## 🔐 Authentication

### Register a new user

```bash
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Sign in

```bash
POST /auth/signin
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Response includes both access token and refresh token:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "a1b2c3d4e5f6...",
  "expires_in": 900
}
```

### Refresh tokens

```bash
POST /auth/refresh
{
  "refreshToken": "your_refresh_token_here"
}
```

### Logout

```bash
POST /auth/logout
Authorization: Bearer your_access_token
{
  "refreshToken": "your_refresh_token_here"
}
```

## 🛡️ Authorization System

The API uses a comprehensive RBAC system with permissions and roles:

### Default Roles

- **Admin**: Full system access
- **Editor**: Can manage posts and users
- **Author**: Can create and manage own posts
- **Reader**: Read-only access

### Using Permissions in Controllers

```typescript
@RequirePermissions(PERMISSIONS.CREATE_POST)
@UseGuards(AuthGuard, PermissionsGuard)
@Post()
createPost(@Body() createPostDto: CreatePostDto) {
  // Implementation
}
```

## 📖 API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/signin` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get current user profile

### Posts Management

- `GET /posts` - List posts with pagination
- `POST /posts` - Create new post
- `GET /posts/:id` - Get specific post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

### User Management

- `GET /users` - List users (admin only)
- `PUT /users/profile` - Update user profile
- `PUT /users/password` - Update password

### RBAC Management

- `POST /rbac/assign-role` - Assign role to user (admin only)

## 🗃️ Database Schema

### Key Entities

**Users Table**

- id, name, email, password (hashed)
- roles (many-to-many relationship)
- createdAt, updatedAt

**Posts Table**

- id, title, content, visibility
- author (foreign key to users)
- createdAt, updatedAt

**Refresh Tokens Table**

- id, token, userId, expiresAt, isRevoked
- userAgent, ipAddress (for security tracking)

**Roles & Permissions**

- Roles: id, name, description
- Permissions: id, name, description
- Many-to-many relationships between users-roles and roles-permissions

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start in debug mode

# Building
npm run build              # Build for production
npm run start:prod         # Start production build

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Database Migrations
npm run m:g <name>         # Generate new migration
npm run m:run              # Run pending migrations
npm run m:revert           # Revert last migration

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

### Database Migrations

When you modify entities, generate a new migration:

```bash
npm run m:g src/migrations/DescriptiveMigrationName
npm run m:run
```

## 📁 Project Structure

```
src/
├── auth/                  # Authentication module
│   ├── dto/              # Data Transfer Objects
│   ├── guards/           # Auth guards
│   └── types/            # Type definitions
├── common/               # Shared utilities
│   ├── constants/        # App constants
│   ├── dto/             # Common DTOs
│   └── utils/           # Utility functions
├── migrations/          # Database migrations
├── posts/               # Posts module
├── rbac/                # Role-based access control
├── users/               # Users module
├── roles/               # Roles entities
├── permissions/         # Permissions entities
└── seeds/               # Database seeding
```

## 🔒 Security Features

- **Password Security**: Bcrypt hashing with salt rounds
- **JWT Security**: Short-lived access tokens with refresh token rotation
- **Input Validation**: Comprehensive validation using class-validator
- **Data Serialization**: Automatic exclusion of sensitive fields
- **RBAC**: Fine-grained permission system
- **Session Management**: Refresh token tracking and revocation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the UNLICENSED License.

## 👨‍💻 Author

- [Noureddin Etkaidek](https://github.com/nooretk)

Created as part of ASAL Training Final Project - 3rd Year Engineering Degree

---

For more detailed information about specific endpoints and their usage, please refer to the Swagger documentation at `/api` when the application is running.
