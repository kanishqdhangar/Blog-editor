## 📝 Blog Editor - Full Stack Assignment
A full-stack blogging platform where users can create, auto-save, update, and publish blog posts. This project is built using Next.js for the frontend and Express.js + MongoDB for the backend.
- **🚀 Features**
- •	✅ Create, edit, and update blog posts
- •	✅ Save as Draft or Publish
- •	✅ Auto-save draft after 5 seconds of inactivity
- •	✅ Tag input (comma-separated)
- •	✅ View all blogs (published and drafts separately)
- •	✅ Edit existing drafts/posts
- •	✅ Toast notifications for feedback

--- 

## 🛠️ Tech Stack
Frontend (Next.js): React 19, Next.js 15, Tailwind CSS 4, Axios, React Toastify
Backend (Express.js): Node.js, Express.js, MongoDB, Mongoose, CORS, Dotenv

## 📂 Project Structure

    blog-editor/
    ├── frontend/        # Next.js frontend
    │   ├── src/
    │   │   ├── app/
    |   │   │   ├── editor/
    |   |   │   │   ├── page.tsx
    |   │   │   ├── page.tsx
    │   │   ├── components/
    |   │   │   ├── BlogEditor.tsx
    │   │   ├── lib/
    |   |   │   ├── api.ts
    ├── backend/         # Express backend
    │   ├── routes/
    │   │   ├── blogRoutes.js
    │   ├── models/
    │   │   ├── Blog.js
    │   └── server.js, .env

--- 

## 🔧 Setup Instructions
- 1. Clone the Repository
    git clone https://github.com/your-username/blog-editor.git
    cd blog-editor
- 2. Setup Backend
    cd backend
    npm install
    Create a .env file and add:
    MONGO_URI=mongodb://localhost:27017/blog_editor
    Start backend:
    node app.js
- 3. Setup Frontend
    cd frontend
    npm install
    npm run dev

--- 

## 📡 API Endpoints
- Method	Endpoint	Description
- POST	/api/blogs/save-draft	Save or update a draft
- POST	/api/blogs/publish	Save and publish a blog
- GET	/api/blogs	Get all blogs
- GET	/api/blogs/:id	Get a single blog by ID

## 🖼 Screens
- /editor – Create a new blog
- /editor/:id – Edit existing blog
- /blogs – View all blogs

## 🎯 Bonus Features
- 🔁 Auto-save on inactivity (5s)
- 🔔 Toast notifications

--- 

## 📃 License
- This project is for educational and internship evaluation purposes.
- 🤝 Author
- Kanishq Dhangar
- GitHub: https://github.com/kanishqdhangar

--- 
