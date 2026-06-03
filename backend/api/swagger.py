"""OpenAPI 3.0 specification for the portfolio-MDE_dashboard API.

This module centralizes the Swagger/OpenAPI document used by the local
Swagger UI page and the raw JSON spec endpoint.
"""

from __future__ import annotations

OPENAPI_SPEC = {
    "openapi": "3.0.3",
    "info": {
        "title": "portfolio-MDE_dashboard API",
        "version": "1.0.0",
        "description": "Swagger/OpenAPI documentation for the Flask REST API.",
    },
    "servers": [
        {"url": "http://127.0.0.1:5000", "description": "Local development"},
    ],
    "tags": [
        {"name": "Health"},
        {"name": "Auth"},
        {"name": "Users"},
        {"name": "Companies"},
        {"name": "Trainings"},
        {"name": "Conversations"},
        {"name": "Messages"},
        {"name": "Notifications"},
        {"name": "News"},
        {"name": "Formation Users"},
    ],
    "components": {
        "securitySchemes": {
            "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
            }
        },
        "schemas": {
            "ErrorResponse": {
                "type": "object",
                "properties": {
                    "error": {
                        "type": "object",
                        "properties": {
                            "code": {"type": "string"},
                            "message": {"type": "string"},
                            "details": {"nullable": True, "example": None, "description": "Expected type: object, array, string, boolean, number, or null."},
                        },
                        "required": ["code", "message"],
                    }
                },
            },
            "AuthLoginRequest": {
                "type": "object",
                "required": ["email", "password"],
                "properties": {
                    "email": {"type": "string", "example": "admin@admin.com"},
                    "password": {"type": "string", "example": "admin"},
                },
            },
            "AuthRegisterRequest": {
                "type": "object",
                "required": ["email", "password"],
                "properties": {
                    "email": {"type": "string", "example": "user@example.com"},
                    "password": {"type": "string", "example": "password123"},
                    "first_name": {"type": "string", "example": "John"},
                    "last_name": {"type": "string", "example": "Doe"},
                },
            },
            "UserCreateRequest": {
                "type": "object",
                "required": ["email", "password"],
                "properties": {
                    "email": {"type": "string"},
                    "password": {"type": "string"},
                    "first_name": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "last_name": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "phone": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "profile_picture": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "business_card": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "is_super_admin": {"type": "boolean", "nullable": True, "example": None, "description": "Expected type: boolean or null."},
                    "company_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                },
            },
            "UserCreateMultipartRequest": {
                "type": "object",
                "required": ["email", "password"],
                "properties": {
                    "email": {"type": "string"},
                    "password": {"type": "string"},
                    "first_name": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "last_name": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "phone": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "profile_picture_file": {"type": "string", "format": "binary", "nullable": True, "description": "Upload a profile image file."},
                    "business_card_file": {"type": "string", "format": "binary", "nullable": True, "description": "Upload a business card image file."},
                    "is_super_admin": {"type": "boolean", "nullable": True, "example": None, "description": "Expected type: boolean or null."},
                    "company_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                },
            },
            "UserUpdateRequest": {
                "type": "object",
                "properties": {
                    "first_name": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "last_name": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "phone": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "profile_picture": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "business_card": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "company_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "is_super_admin": {"type": "boolean", "nullable": True, "example": None, "description": "Expected type: boolean or null."},
                    "is_active": {"type": "boolean", "nullable": True, "example": None, "description": "Expected type: boolean or null."},
                },
            },
            "UserUpdateMultipartRequest": {
                "type": "object",
                "properties": {
                    "first_name": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "last_name": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "phone": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "profile_picture_file": {"type": "string", "format": "binary", "nullable": True, "description": "Upload a profile image file."},
                    "business_card_file": {"type": "string", "format": "binary", "nullable": True, "description": "Upload a business card image file."},
                    "company_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "is_super_admin": {"type": "boolean", "nullable": True, "example": None, "description": "Expected type: boolean or null."},
                    "is_active": {"type": "boolean", "nullable": True, "example": None, "description": "Expected type: boolean or null."},
                },
            },
            "PasswordResetRequest": {
                "type": "object",
                "required": ["password"],
                "properties": {"password": {"type": "string"}},
            },
            "CompanyCreateRequest": {
                "type": "object",
                "required": ["name", "admin_email"],
                "properties": {
                    "name": {"type": "string"},
                    "description": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "website_link": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "company_picture": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "admin_email": {"type": "string"},
                    "admin_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null. Optional admin user id."},
                },
            },
            "CompanyCreateMultipartRequest": {
                "type": "object",
                "required": ["name", "admin_email"],
                "properties": {
                    "name": {"type": "string"},
                    "description": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "website_link": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "company_picture_file": {"type": "string", "format": "binary", "nullable": True, "description": "Upload a company image file."},
                    "admin_email": {"type": "string"},
                    "admin_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null. Optional admin user id."},
                },
            },
            "CompanyUpdateRequest": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "description": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "website_link": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "company_picture": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "admin_email": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "admin_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null. Optional admin user id."},
                    "is_active": {"type": "boolean", "nullable": True, "example": None, "description": "Expected type: boolean or null."},
                },
            },
            "CompanyUpdateMultipartRequest": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "description": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "website_link": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "company_picture_file": {"type": "string", "format": "binary", "nullable": True, "description": "Upload a company image file."},
                    "admin_email": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "admin_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null. Optional admin user id."},
                    "is_active": {"type": "boolean", "nullable": True, "example": None, "description": "Expected type: boolean or null."},
                },
            },
            "TrainingCreateRequest": {
                "type": "object",
                "required": ["title"],
                "properties": {
                    "title": {"type": "string"},
                    "company_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "description": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "picture": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                },
            },
            "TrainingCreateMultipartRequest": {
                "type": "object",
                "required": ["title"],
                "properties": {
                    "title": {"type": "string"},
                    "company_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "description": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "picture_file": {"type": "string", "format": "binary", "nullable": True, "description": "Upload a training image file."},
                },
            },
            "TrainingUpdateRequest": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "company_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "description": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "picture": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "is_active": {"type": "boolean", "nullable": True, "example": None, "description": "Expected type: boolean or null."},
                },
            },
            "TrainingUpdateMultipartRequest": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "company_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "description": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "picture_file": {"type": "string", "format": "binary", "nullable": True, "description": "Upload a training image file."},
                    "is_active": {"type": "boolean", "nullable": True, "example": None, "description": "Expected type: boolean or null."},
                },
            },
            "ConversationCreateRequest": {
                "type": "object",
                "properties": {
                    "participant_ids": {
                        "type": "array",
                        "items": {"type": "string"},
                        "nullable": True,
                        "example": None,
                        "description": "Expected type: array of string or null.",
                    }
                },
            },
            "ConversationPatchRequest": {
                "type": "object",
                "properties": {
                    "participant_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "action": {"type": "string", "enum": ["add", "remove"], "nullable": True, "example": None, "description": "Expected type: string or null. Allowed values: add, remove."},
                },
            },
            "MessageCreateRequest": {
                "type": "object",
                "required": ["content"],
                "properties": {
                    "author_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "recipient_id": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "content": {"type": "string"},
                },
            },
            "NotificationCreateRequest": {
                "type": "object",
                "required": ["recipient_id", "content"],
                "properties": {
                    "recipient_id": {"type": "string"},
                    "content": {"type": "string"},
                    "is_read": {"type": "boolean", "nullable": True, "example": None, "description": "Expected type: boolean or null."},
                },
            },
            "NewsCreateRequest": {
                "type": "object",
                "required": ["title"],
                "properties": {
                    "title": {"type": "string"},
                    "source": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "summary": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "url": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "published_at": {"type": "string", "format": "date-time", "nullable": True, "example": None, "description": "Expected type: date-time string or null."},
                },
            },
            "EnrollmentCreateRequest": {
                "type": "object",
                "required": ["user_id", "training_id"],
                "properties": {
                    "user_id": {"type": "string"},
                    "training_id": {"type": "string"},
                    "status": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "progress": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                },
            },
            "EnrollmentUpdateRequest": {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "progress": {"type": "string", "nullable": True, "example": None, "description": "Expected type: string or null."},
                    "enrolled_at": {"type": "string", "format": "date-time", "nullable": True, "example": None, "description": "Expected type: date-time string or null."},
                },
            },
        },
    },
    "security": [{"bearerAuth": []}],
    "paths": {
        "/": {
            "get": {
                "tags": ["Health"],
                "summary": "Health check",
                "responses": {"200": {"description": "OK"}},
            }
        },
        "/auth/register": {
            "post": {
                "tags": ["Auth"],
                "summary": "Register a user",
                "requestBody": {
                    "required": True,
                    "content": {"application/json": {"schema": {"$ref": "#/components/schemas/AuthRegisterRequest"}}},
                },
                "responses": {"201": {"description": "Created"}, "400": {"description": "Validation error"}},
            }
        },
        "/auth/login": {
            "post": {
                "tags": ["Auth"],
                "summary": "Login and obtain JWT tokens",
                "requestBody": {
                    "required": True,
                    "content": {"application/json": {"schema": {"$ref": "#/components/schemas/AuthLoginRequest"}}},
                },
                "responses": {"200": {"description": "OK"}, "401": {"description": "Invalid credentials"}},
            }
        },
        "/auth/refresh": {
            "post": {
                "tags": ["Auth"],
                "summary": "Refresh access token",
                "security": [{"bearerAuth": []}],
                "responses": {"200": {"description": "OK"}},
            }
        },
        "/auth/logout": {
            "post": {
                "tags": ["Auth"],
                "summary": "Revoke current token",
                "security": [{"bearerAuth": []}],
                "responses": {"200": {"description": "OK"}},
            }
        },
        "/users": {
            "get": {
                "tags": ["Users"],
                "summary": "List users",
                "parameters": [
                    {"name": "limit", "in": "query",
                        "schema": {"type": "integer"}},
                    {"name": "company_id", "in": "query",
                        "schema": {"type": "string"}},
                ],
                "responses": {"200": {"description": "OK"}, "401": {"$ref": "#/components/schemas/ErrorResponse"}},
            },
            "post": {
                "tags": ["Users"],
                "summary": "Create user",
                "requestBody": {"required": True, "content": {"multipart/form-data": {"schema": {"$ref": "#/components/schemas/UserCreateMultipartRequest"}}}},
                "responses": {"201": {"description": "Created"}},
            },
        },
        "/users/me": {
            "get": {"tags": ["Users"], "summary": "Current user profile", "responses": {"200": {"description": "OK"}}},
            "patch": {
                "tags": ["Users"],
                "summary": "Update current user",
                "requestBody": {"required": True, "content": {"multipart/form-data": {"schema": {"$ref": "#/components/schemas/UserUpdateMultipartRequest"}}}},
                "responses": {"200": {"description": "OK"}},
            },
        },
        "/me": {"get": {"tags": ["Users"], "summary": "Alias for current user profile", "responses": {"200": {"description": "OK"}}}},
        "/users/{user_id}": {
            "get": {"tags": ["Users"], "summary": "Get user by id", "parameters": [{"name": "user_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}},
            "put": {"tags": ["Users"], "summary": "Replace user fields", "parameters": [{"name": "user_id", "in": "path", "required": True, "schema": {"type": "string"}}], "requestBody": {"required": True, "content": {"multipart/form-data": {"schema": {"$ref": "#/components/schemas/UserUpdateMultipartRequest"}}}}, "responses": {"200": {"description": "OK"}}},
            "patch": {"tags": ["Users"], "summary": "Partial update user", "parameters": [{"name": "user_id", "in": "path", "required": True, "schema": {"type": "string"}}], "requestBody": {"required": True, "content": {"multipart/form-data": {"schema": {"$ref": "#/components/schemas/UserUpdateMultipartRequest"}}}}, "responses": {"200": {"description": "OK"}}},
            "delete": {"tags": ["Users"], "summary": "Permanently delete user", "parameters": [{"name": "user_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}},
        },
        "/users/{user_id}/deactivate": {"patch": {"tags": ["Users"], "summary": "Deactivate user without deleting", "parameters": [{"name": "user_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}},
        "/users/{user_id}/reset-password": {"post": {"tags": ["Users"], "summary": "Reset password", "parameters": [{"name": "user_id", "in": "path", "required": True, "schema": {"type": "string"}}], "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/PasswordResetRequest"}}}}, "responses": {"200": {"description": "OK"}}}},
        "/companies": {"get": {"tags": ["Companies"], "summary": "List companies", "responses": {"200": {"description": "OK"}}}, "post": {"tags": ["Companies"], "summary": "Create company", "requestBody": {"required": True, "content": {"multipart/form-data": {"schema": {"$ref": "#/components/schemas/CompanyCreateMultipartRequest"}}}}, "responses": {"201": {"description": "Created"}, "400": {"description": "admin_email is required"}}}},
        "/companies/{company_id}": {"get": {"tags": ["Companies"], "summary": "Get company", "parameters": [{"name": "company_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}, "patch": {"tags": ["Companies"], "summary": "Update company", "parameters": [{"name": "company_id", "in": "path", "required": True, "schema": {"type": "string"}}], "requestBody": {"required": True, "content": {"multipart/form-data": {"schema": {"$ref": "#/components/schemas/CompanyUpdateMultipartRequest"}}}}, "responses": {"200": {"description": "OK"}}}, "delete": {"tags": ["Companies"], "summary": "Deactivate company", "parameters": [{"name": "company_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}},
        "/companies/{company_id}/users": {"get": {"tags": ["Companies"], "summary": "List users for company", "parameters": [{"name": "company_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}},
        "/companies/{company_id}/users/{user_id}": {"post": {"tags": ["Companies"], "summary": "Assign user to company", "parameters": [{"name": "company_id", "in": "path", "required": True, "schema": {"type": "string"}}, {"name": "user_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}, "delete": {"tags": ["Companies"], "summary": "Remove user from company", "parameters": [{"name": "company_id", "in": "path", "required": True, "schema": {"type": "string"}}, {"name": "user_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}},
        "/trainings": {"get": {"tags": ["Trainings"], "summary": "List trainings", "responses": {"200": {"description": "OK"}}}, "post": {"tags": ["Trainings"], "summary": "Create training", "requestBody": {"required": True, "content": {"multipart/form-data": {"schema": {"$ref": "#/components/schemas/TrainingCreateMultipartRequest"}}}}, "responses": {"201": {"description": "Created"}}}},
        "/trainings/{training_id}": {"get": {"tags": ["Trainings"], "summary": "Get training", "parameters": [{"name": "training_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}, "patch": {"tags": ["Trainings"], "summary": "Update training", "parameters": [{"name": "training_id", "in": "path", "required": True, "schema": {"type": "string"}}], "requestBody": {"required": True, "content": {"multipart/form-data": {"schema": {"$ref": "#/components/schemas/TrainingUpdateMultipartRequest"}}}}, "responses": {"200": {"description": "OK"}}}, "delete": {"tags": ["Trainings"], "summary": "Deactivate training", "parameters": [{"name": "training_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}},
        "/trainings/{training_id}/enroll": {"post": {"tags": ["Trainings"], "summary": "Enroll user in training", "parameters": [{"name": "training_id", "in": "path", "required": True, "schema": {"type": "string"}}], "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/EnrollmentCreateRequest"}}}}, "responses": {"201": {"description": "Created"}}}},
        "/trainings/{training_id}/join": {"post": {"tags": ["Trainings"], "summary": "Alias for enroll", "parameters": [{"name": "training_id", "in": "path", "required": True, "schema": {"type": "string"}}], "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/EnrollmentCreateRequest"}}}}, "responses": {"201": {"description": "Created"}}}},
        "/trainings/{training_id}/enrollments": {"get": {"tags": ["Trainings"], "summary": "List enrollments for training", "parameters": [{"name": "training_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}},
        "/users/{user_id}/trainings": {"get": {"tags": ["Trainings"], "summary": "List trainings for user", "parameters": [{"name": "user_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}},
        "/me/trainings": {"get": {"tags": ["Trainings"], "summary": "List current user trainings", "responses": {"200": {"description": "OK"}}}},
        "/conversations": {"get": {"tags": ["Conversations"], "summary": "List conversations", "responses": {"200": {"description": "OK"}}}, "post": {"tags": ["Conversations"], "summary": "Create conversation", "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/ConversationCreateRequest"}}}}, "responses": {"201": {"description": "Created"}}}},
        "/rooms": {"get": {"tags": ["Conversations"], "summary": "Alias for list conversations", "responses": {"200": {"description": "OK"}}}, "post": {"tags": ["Conversations"], "summary": "Alias for create conversation", "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/ConversationCreateRequest"}}}}, "responses": {"201": {"description": "Created"}}}},
        "/conversations/{conversation_id}": {"get": {"tags": ["Conversations"], "summary": "Get conversation", "parameters": [{"name": "conversation_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}, "patch": {"tags": ["Conversations"], "summary": "Modify conversation participants", "parameters": [{"name": "conversation_id", "in": "path", "required": True, "schema": {"type": "string"}}], "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/ConversationPatchRequest"}}}}, "responses": {"200": {"description": "OK"}}}, "delete": {"tags": ["Conversations"], "summary": "Deactivate conversation", "parameters": [{"name": "conversation_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}},
        "/rooms/{conversation_id}": {"get": {"tags": ["Conversations"], "summary": "Alias for get conversation", "parameters": [{"name": "conversation_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}, "patch": {"tags": ["Conversations"], "summary": "Alias for modify conversation participants", "parameters": [{"name": "conversation_id", "in": "path", "required": True, "schema": {"type": "string"}}], "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/ConversationPatchRequest"}}}}, "responses": {"200": {"description": "OK"}}}, "delete": {"tags": ["Conversations"], "summary": "Alias for deactivate conversation", "parameters": [{"name": "conversation_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}},
        "/conversations/{conversation_id}/messages": {"get": {"tags": ["Messages"], "summary": "List messages in conversation", "parameters": [{"name": "conversation_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}, "post": {"tags": ["Messages"], "summary": "Post message in conversation", "parameters": [{"name": "conversation_id", "in": "path", "required": True, "schema": {"type": "string"}}], "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/MessageCreateRequest"}}}}, "responses": {"201": {"description": "Created"}}}},
        "/rooms/{conversation_id}/messages": {"get": {"tags": ["Messages"], "summary": "Alias for list messages in conversation", "parameters": [{"name": "conversation_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}, "post": {"tags": ["Messages"], "summary": "Alias for post message in conversation", "parameters": [{"name": "conversation_id", "in": "path", "required": True, "schema": {"type": "string"}}], "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/MessageCreateRequest"}}}}, "responses": {"201": {"description": "Created"}}}},
        "/messages": {"get": {"tags": ["Messages"], "summary": "List messages", "responses": {"200": {"description": "OK"}}}},
        "/messages/{message_id}": {"delete": {"tags": ["Messages"], "summary": "Delete message", "parameters": [{"name": "message_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}},
        "/notifications": {"get": {"tags": ["Notifications"], "summary": "List notifications", "responses": {"200": {"description": "OK"}}}, "post": {"tags": ["Notifications"], "summary": "Create notification", "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/NotificationCreateRequest"}}}}, "responses": {"201": {"description": "Created"}}}},
        "/notifications/{notification_id}": {"patch": {"tags": ["Notifications"], "summary": "Mark notification as read", "parameters": [{"name": "notification_id", "in": "path", "required": True, "schema": {"type": "string"}}], "requestBody": {"required": True, "content": {"application/json": {"schema": {"type": "object", "properties": {"is_read": {"type": "boolean"}}}}}}, "responses": {"200": {"description": "OK"}}}, "delete": {"tags": ["Notifications"], "summary": "Delete notification", "parameters": [{"name": "notification_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}},
        "/news": {"get": {"tags": ["News"], "summary": "List news", "responses": {"200": {"description": "OK"}}}, "post": {"tags": ["News"], "summary": "Create news item", "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/NewsCreateRequest"}}}}, "responses": {"201": {"description": "Created"}}}},
        "/news/{news_id}": {"get": {"tags": ["News"], "summary": "Get news item", "parameters": [{"name": "news_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}, "delete": {"tags": ["News"], "summary": "Delete news item", "parameters": [{"name": "news_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}},
        "/news/sync": {"post": {"tags": ["News"], "summary": "Sync news (not implemented)", "responses": {"501": {"description": "Not implemented"}}}},
        "/formation-users": {"get": {"tags": ["Formation Users"], "summary": "List enrollment relations", "responses": {"200": {"description": "OK"}}}, "post": {"tags": ["Formation Users"], "summary": "Create enrollment relation", "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/EnrollmentCreateRequest"}}}}, "responses": {"201": {"description": "Created"}}}},
        "/formation-users/{relation_id}": {"get": {"tags": ["Formation Users"], "summary": "Get enrollment relation", "parameters": [{"name": "relation_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}, "patch": {"tags": ["Formation Users"], "summary": "Update enrollment relation", "parameters": [{"name": "relation_id", "in": "path", "required": True, "schema": {"type": "string"}}], "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/EnrollmentUpdateRequest"}}}}, "responses": {"200": {"description": "OK"}}}, "delete": {"tags": ["Formation Users"], "summary": "Delete enrollment relation", "parameters": [{"name": "relation_id", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}},
    },
}

SWAGGER_UI_HTML = """<!doctype html>
<html lang=\"en\">
  <head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    <title>portfolio-MDE_dashboard API Docs</title>
    <link rel=\"stylesheet\" href=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui.css\" />
    <style>
            :root {
                color-scheme: light;
            }

            html, body {
                margin: 0;
                padding: 0;
                background: #f8fafc;
                color: #0f172a;
                font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }

      #swagger-ui { max-width: 100vw; }

            .topbar {
                display: none;
            }

            .swagger-ui .wrapper {
                background: #f8fafc;
            }

            .swagger-ui .info .title,
            .swagger-ui .info p,
            .swagger-ui .info li,
            .swagger-ui .scheme-container,
            .swagger-ui .opblock-tag,
            .swagger-ui .renderedMarkdown,
            .swagger-ui .parameter__name,
            .swagger-ui .parameter__type,
            .swagger-ui .response-col_status,
            .swagger-ui .response-col_description,
            .swagger-ui .tab li,
            .swagger-ui .opblock .opblock-summary-description {
                color: #0f172a;
            }

            .swagger-ui .opblock {
                border-color: #cbd5e1;
                background: #ffffff;
            }

            .swagger-ui .opblock.opblock-get {
                border-color: #93c5fd;
                background: #eff6ff;
            }

            .swagger-ui .opblock.opblock-post {
                border-color: #86efac;
                background: #f0fdf4;
            }

            .swagger-ui .opblock.opblock-patch,
            .swagger-ui .opblock.opblock-put {
                border-color: #fcd34d;
                background: #fffbeb;
            }

            .swagger-ui .opblock.opblock-delete {
                border-color: #fca5a5;
                background: #fef2f2;
            }

            .swagger-ui .btn,
            .swagger-ui button,
            .swagger-ui input,
            .swagger-ui select,
            .swagger-ui textarea {
                font-family: inherit;
            }

            .swagger-ui select,
            .swagger-ui input,
            .swagger-ui textarea {
                background: #ffffff;
                color: #0f172a;
                border-color: #cbd5e1;
            }

            .swagger-ui .btn.authorize,
            .swagger-ui .btn.execute {
                background-color: #2563eb;
                color: #ffffff;
                border-color: #2563eb;
            }

            .swagger-ui .btn.authorize:hover,
            .swagger-ui .btn.execute:hover {
                background-color: #1d4ed8;
                border-color: #1d4ed8;
            }
    </style>
  </head>
  <body>
    <div id=\"swagger-ui\"></div>
    <script src=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js\"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          displayRequestDuration: true,
          docExpansion: 'list',
          persistAuthorization: true,
        });
      };
    </script>
  </body>
</html>
"""
