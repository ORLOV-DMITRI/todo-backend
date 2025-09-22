# TODO APP - API DOCUMENTATION

## Базовая информация
- **Base URL:** `http://localhost:5000`
- **Версия:** 1.0.0
- **Аутентификация:** JWT токен в заголовке `Authorization: Bearer {token}`

## Эндпоинты

### 1. Проверка статуса сервера
```
GET /
```
**Ответ:**
```json
{
  "message": "Todo App Backend API",
  "version": "1.0.0",
  "status": "running"
}
```

### 2. Регистрация пользователя
```
POST /api/auth/register
Content-Type: application/json
```
**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```
**Успешный ответ (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-09-17T06:00:00.000Z"
  }
}
```
**Ошибки:**
- `400` - Email already exists, Invalid email format, Password too short
- `500` - Internal server error

### 3. Вход пользователя
```
POST /api/auth/login
Content-Type: application/json
```
**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Успешный ответ (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-09-17T06:00:00.000Z"
  }
}
```
**Ошибки:**
- `400` - Email and password are required
- `401` - Invalid credentials
- `500` - Internal server error

### 4. Получение профиля пользователя
```
GET /api/auth/me
Authorization: Bearer {jwt-token}
```
**Успешный ответ (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-09-17T06:00:00.000Z",
    "updatedAt": "2025-09-17T06:00:00.000Z"
  }
}
```
**Ошибки:**
- `401` - Access token required, Invalid or expired token
- `404` - User not found
- `500` - Internal server error

### 5. Google OAuth авторизация
```
GET /api/auth/google
```
**Описание:** Перенаправляет на страницу авторизации Google

**Callback:**
```
GET /api/auth/google/callback
```
**Описание:** Обрабатывает ответ от Google и перенаправляет на frontend с токеном
**Успешный редирект:** `{FRONTEND_URL}?token={jwt-token}`
**Ошибка:** `{FRONTEND_URL}?error={error-type}`

### 6. GitHub OAuth авторизация
```
GET /api/auth/github
```
**Описание:** Перенаправляет на страницу авторизации GitHub

**Callback:**
```
GET /api/auth/github/callback
```
**Описание:** Обрабатывает ответ от GitHub и перенаправляет на frontend с токеном
**Успешный редирект:** `{FRONTEND_URL}?token={jwt-token}`
**Ошибка:** `{FRONTEND_URL}?error={error-type}`

## Коды ошибок OAuth
- `oauth_error` - Ошибка в процессе OAuth
- `oauth_failed` - OAuth не удался (пользователь отменил)
- `token_error` - Ошибка создания JWT токена

## Примеры использования с cURL

### Регистрация:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Вход:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Получение профиля:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Настройка OAuth

### Google OAuth:
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API
4. Создайте OAuth 2.0 credentials
5. Добавьте в .env:
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

### GitHub OAuth:
1. Перейдите в [GitHub Developer Settings](https://github.com/settings/developers)
2. Создайте новое OAuth App
3. Установите Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Добавьте в .env:
   ```
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```