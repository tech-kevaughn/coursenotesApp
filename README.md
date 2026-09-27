# CourseNotes App

CourseNotes is a web-based assignment management application designed to help college students organize their courses, assignments, due dates, and academic tasks.

The application allows users to create an account, securely log in, and manage their own assignments through a simple dashboard.

## YouTube 

https://youtu.be/xD5jn7dN1dg 


## Features

- User registration and login
- Secure user authentication
- Add new assignments
- View assignments
- Update assignment information and status
- Delete assignments
- Track assignment due dates
- Add notes to assignments
- Assignment status tracking
- User-specific assignment data
- Row Level Security (RLS) to prevent users from accessing other users' assignments
- Cloud-hosted PostgreSQL database
- Publicly deployed web application


## Project Structure

coursenotesApp
├── app.js
├── index.html
├── README.md
└── style.css


## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend and Database
- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Row Level Security (RLS)

### Development and Deployment
- Visual Studio Code
- Git
- GitHub
- Netlify

## Database Structure

The application uses an `assignments` table containing the following fields:

| Column | Type | Purpose |
|---|---|---|
| id | int8 | Unique assignment identifier |
| course_name | text | Name of the course |
| assignment_name | text | Name of the assignment |
| due_date | date | Assignment due date |
| status | text | Current assignment status |
| notes | text | Additional assignment notes |
| user_id | uuid | Associates an assignment with its user |

## Security

CourseNotes uses Supabase Authentication to manage user accounts.

Each assignment is associated with the authenticated user's unique ID.

Row Level Security (RLS) policies restrict database operations so authenticated users can only access and modify their own assignment records.

Policies are configured for:

- SELECT — Users can view their own assignments
- INSERT — Users can create their own assignments
- UPDATE — Users can update their own assignments
- DELETE — Users can delete their own assignments

This prevents one authenticated user from accessing another user's assignment data.

## How It Works

1. A user registers for a CourseNotes account.
2. Supabase Authentication creates and authenticates the user.
3. The user logs into the application.
4. The user can create assignments containing course information, due dates, status, and notes.
5. Assignments are stored in the Supabase PostgreSQL database.
6. Each assignment is associated with the authenticated user's ID.
7. Row Level Security controls access to the assignment records.
8. Users can view, update, and delete their own assignments.


## Live Application

CourseNotes is deployed using Netlify:

https://coursenotes-app.netlify.app




