# Line ToDo App API Documentation

## _Base URL_

```
http://localhost:5000

```

---

## ** Authentication Endpoints **

### ** Register a new user **

**Endpoint:** `POST /auth/register`

Register a new user.

✅ **Admin users must be manually assigned.**

#### **Request:**

```json
{
  "username": "john_doe",
  "password": "securepassword"
}
```

#### **Response:**

```json
{
  "message": "User registered",
  "userId": "someObjectId",
  "role": "user"
}
```

### ** Login to the application **

**Endpoint:** `POST /auth/login`

#### **Request:**

```json
{
  "username": "john_doe",
  "password": "securepassword"
}
```

#### **Response:**

```json
{
  "message": "Login successful",
  "token": "your-jwt-token",
  "role": "user"
}
```

### ** Request a password reset **

**Endpoint:** `POST /auth/request-reset`

#### **Request:**

```json
{
  "email": "john_doe@example.com"
}
```

#### **Response:**

```json
{
  "message": "Password reset email sent"
}
```

### ** Reset password **

**Endpoint:** `POST /auth/reset-password`

#### **Request:**

```json
{
  "token": "your-jwt-token",
  "newPassword": "newsecurepassword"
}
```

#### **Response:**

```json
{
  "message": "Password reset successful"
}
```

## ** Tasks Endpoints **

### ** Get all tasks **

**Request Header:**

```
Authorization: Bearer your-jwt-token
```

**Endpoint:** `GET /tasks`

**Response:**

```json
{
  "tasks": [
    {
      "title": "Task 1",
      "completed": false,
      "priority": 1
    },
    {
      "title": "Task 2",
      "completed": true,
      "priority": 2
    }
  ]
}
```

### ** filtering options **

**Request Header:**

```
Authorization: Bearer your-jwt-token
```

**Query Params:**

```
?completed=true
?priority=1
```

**Response:**

```json
{
  "tasks": [
    {
      "title": "Task 1",
      "completed": false,
      "priority": 1
    }
  ]
}
```

### ** Create a new task **

**Request Header:**

```
Authorization: Bearer your-jwt-token
```

**Endpoint:** `POST /tasks`

**Request Body:**

```json
{
  "title": "New Task",
  "priority": 1,
  "completed": false
}
```

**Response:**

```json
{
  "message": "Task created successfully",
  "taskId": "someObjectId"
}
```

### ** Update a task **

**Request Header:**

```
Authorization: Bearer your-jwt-token
```

**Endpoint:** `PUT /tasks/:taskId`

**Request Body:**

```json
{
  "completed": true
}
```

**Response:**

```json
{
  "message": "Task updated successfully"
}
```

### ** Delete a task **

**Endpoint:** `DELETE /tasks/:taskId`

**Request Header:**

```
Authorization: Bearer your-jwt-token
```

**Response:**

```json
{
  "message": "Task deleted successfully"
}
```

## ** Security Features **

### ** JWT Authentication **

### ** Role-based access - Users manage their own tasks, Admins manage all. **

### ** Password Hashing - Password are hashed using bcrypt. **

### ** Rate Limiting - Max 5 login attempts per 15 minutes, 60 requests per minute. **
