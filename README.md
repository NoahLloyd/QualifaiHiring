# Qualifai Hiring (AI Talent Tracker)

This project is a web application designed to track and manage job applicants, incorporating AI features for processing and analysis. It uses a React-based frontend and an Express/Node.js backend.

## Technologies Used

- **Backend:** Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL (potentially NeonDB), Passport.js, SendGrid
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Shadcn UI, TanStack Table, Recharts
- **Database:** PostgreSQL (managed with Drizzle ORM)
- **AI:** OpenAI

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/NoahLloyd/QualifaiHiring.git
    cd QualifaiHiring
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the project root. You will likely need variables for:

    - Database connection string (e.g., `DATABASE_URL`)
    - OpenAI API Key (e.g., `OPENAI_API_KEY`)
    - SendGrid API Key (e.g., `SENDGRID_API_KEY`)
    - Session secret (e.g., `SESSION_SECRET`)
    - _(Potentially others - check server configuration)_

4.  **Apply database schema:**
    Ensure your database server is running and accessible according to your `.env` file.
    ```bash
    npm run db:push
    ```

## Running the Application

- **Development Mode:**
  This command starts the server with hot-reloading for development.

  ```bash
  npm run dev
  ```

- **Production Mode:**
  First, build the project:
  ```bash
  npm run build
  ```
  Then, start the production server:
  ```bash
  npm run start
  ```

---

_Aino, Oliver, Noah_
