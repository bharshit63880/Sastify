# 🛒 Sastify

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen?logo=mongodb)](https://www.mongodb.com/)

**Sastify** is a modern, responsive, full-stack e-commerce application designed to provide a seamless shopping experience. It features a robust React frontend and a scalable Node.js/Express backend powered by MongoDB. 

🚀 **Live Demo:** [Sastify on Vercel](https://sastify-frontend.vercel.app/)

---

## ✨ Features

* **User Authentication:** Secure signup, login, and password reset functionalities using JWT.
* **Product Management:** Browse products through a comprehensive catalog with categories.
* **Shopping Experience:** Add items to a shopping cart and maintain a personalized wishlist.
* **Secure Checkout:** Seamless order placement with multiple payment modes (COD, UPI, CARD).
* **User Dashboard:** Efficient address management and order tracking.
* **Engagement:** Leave reviews and ratings on purchased products.
* **Admin Controls:** Special admin privileges (via `isAdmin` flag) for managing the platform.

---

## 🛠️ Tech Stack

**Frontend**
* **React:** UI Library
* **Material-UI (MUI):** Component library for responsive design
* **Framer Motion:** Smooth animations and page transitions
* **Lottie:** Lightweight, scalable animations

**Backend & Database**
* **Node.js & Express:** RESTful API server
* **MongoDB & Mongoose:** NoSQL Database and object data modeling

**Utilities**
* **JWT:** Secure, token-based authentication
* **Nodemailer:** Email integration (e.g., password resets)
* **Dotenv:** Environment variable management

---

## 📂 Project Structure

```text
Sastify/
├── backend/
│   ├── controllers/      # Route logic and business operations
│   ├── database/         # Database connection setup
│   ├── middleware/       # Express middlewares (auth, error handling)
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API route definitions
│   ├── seed/             # Initial database seeding scripts
│   ├── utils/            # Helper functions
│   ├── .env              # Backend environment variables
│   ├── index.js          # Backend entry point
│   ├── package.json
│   └── vercel.json       # Deployment configuration
├── frontend/
│   ├── public/           # Static assets
│   ├── src/              # React components, pages, and context
│   ├── .env              # Frontend environment variables
│   └── package.json
└── .gitignore
🚀 Getting Started
Follow these instructions to get a copy of the project up and running on your local machine.

Prerequisites
Ensure you have the following installed:

Node.js (v16+ recommended)

npm or yarn

MongoDB (Local instance or MongoDB Atlas cluster)

1. Backend Setup
Navigate to the backend directory:

Bash
    cd backend
    ```
2.  Install dependencies:
```bash
    npm install
    ```
3.  Create a `.env` file in the root of the `backend` directory and add your required environment variables (e.g., `PORT`, `MONGO_URI`, `JWT_SECRET`, email credentials).
4.  *(Optional)* Seed the database with initial data:
```bash
    npm run seed
    ```
5.  Start the backend server:
```bash
    npm run dev
    ```

### 2. Frontend Setup

1.  Open a new terminal window and navigate to the frontend directory:
```bash
    cd frontend
    ```
2.  Install dependencies:
```bash
    npm install
    ```
3.  Create a `.env` file in the root of the `frontend` directory and add your necessary environment variables (e.g., `REACT_APP_API_URL` pointing to your backend).
4.  Start the frontend development server:
```bash
    npm start
    ```

---

## 📜 Scripts Overview

### Backend Scripts
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the backend server in development mode using Nodemon. |
| `npm run seed` | Populates the database with default sample data. |

### Frontend Scripts
| Command | Description |
| :--- | :--- |
| `npm start` | Starts the React development server on `localhost:3000`. |

---

## 📄 License

This project is licensed under the **MIT License**.

> **Note:** Ensure you never commit your `.env` files to version control. They are inclu
