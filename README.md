# 📱 MiPedia

<div align="center">

<img src="https://th.bing.com/th/id/OIG2.38PC_8LMcHFC8ZhGhiEX?w=173&h=173&c=6&r=0&o=5&dpr=1.5&pid=ImgGn" width="100px" alt="Project Logo">

_Connect, Share, Interact - Your Social World_

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yourusername/mipedia)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Contributors](https://img.shields.io/badge/contributors-welcome-orange)](https://github.com/yourusername/mipedia/graphs/contributors)
[![Made with MERN](https://img.shields.io/badge/made%20with-MERN-61dafb)](https://www.mongodb.com/mern-stack)

[Live Demo](#) | [Report Bug](https://github.com/yourusername/mipedia/issues) | [Request Feature](https://github.com/yourusername/mipedia/issues)

</div>

## Table of Contents

- [📱 MiPedia](#-mipedia)
  - [🌟 Overview](#-overview)
    - [✨ Key Features](#-key-features)
  - [🚀 Tech Stack](#-tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Infrastructure](#infrastructure)
  - [🛠️ Installation](#️-installation)
    - [Prerequisites](#prerequisites)
    - [Step-by-Step Setup](#step-by-step-setup)
  - [🎉 Ready to Use!](#-ready-to-use)
  - [Usage](#usage)
  - [Screenshots](#screenshots)
  - [API Reference Chart](#api-reference-chart)
  - [Authentication Endpoints](#authentication-endpoints)
  - [User Endpoints](#user-endpoints)
  - [Post Endpoints](#post-endpoints)
  - [Bookmark Endpoints](#bookmark-endpoints)
  - [Search Endpoint](#search-endpoint)
  - [Protected Routes](#protected-routes)
  - [File Upload](#file-upload)
  - [📂 Project Structure](#-project-structure)
  - [Code Structure](#code-structure)
    - [Project Layout](#project-layout)
    - [Additional Notes](#additional-notes)
  - [File Structure](#file-structure)
  - [Contributing](#contributing)
    - [How to Contribute](#how-to-contribute)
    - [Coding Standards](#coding-standards)
  - [📜 License](#-license)
  - [👥 Team](#-team)
  - [📬 Contact](#-contact)
  - [🙏 Acknowledgments](#-acknowledgments)
  - [📬Getting Help:](#getting-help)
  - [Live Demo](#live-demo)
  - [Related Projects](#related-projects)

## 🌟 Overview

MiPedia is a modern social media platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It offers a seamless experience for connecting with friends, sharing moments, and engaging in real-time conversations.

## ✨ Features

- **User Management**

  - 🔐 Secure authentication & authorization
  - 👤 Customizable user profiles
  - 🔄 Follow/unfollow functionality

- **Content Sharing**

  - 📝 Create, edit & delete posts
  - 📸 Image upload support
  - 💬 Comment system
  - ❤️ Like/unlike interactions

- **Social Features**

  - 💌 Real-time messaging
  - 🔍 User search functionality
  - 🔖 Post bookmarking
  - 👥 Friend suggestions

- **Technical Features**
  - 📱 Responsive design
  - 🚀 Optimized performance
  - 🔒 JWT authentication
  - 💾 Efficient data caching

## 🚀 Tech Stack

### Frontend

- **Core**: React.js 18
- **State Management**: Redux Toolkit
- **Styling**:
  - Tailwind CSS
  - Shadcn UI Components
- **Data Fetching**: RTK Query
- **Routing**: React Router v6

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Real-time**: Socket.IO

### Infrastructure

- **Image Storage**: Cloudinary
- **Deployment**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: PM2

## 🛠️ Installation

### Prerequisites

- Node.js (v18+)
- MongoDB
- Cloudinary account

### Step-by-Step Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/mipedia.git
   cd mipedia
   ```

2. **Environment Setup**

   Create `.env` files in both client and server directories:

   **Client** (`client/.env`)

   ```env
   VITE_API_URL=http://localhost:3000
   VITE_TOKEN_KEY=token
   ```

   **Server** (`server/.env`)

   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/mipedia
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Install Dependencies**

   ```bash
   # Backend dependencies
   cd server
   npm install

   # Frontend dependencies
   cd ../client
   npm install
   ```

4. **Start Development Servers**

   ```bash
   # Start backend (from server directory)
   npm start

   # Start frontend (from client directory)
   npm run dev
   ```

## 🎉 Ready to Use!

Your local development environment is now up and running! You can test and develop new features directly on your local machine.

## Usage

- Open [http://localhost:5173](http://localhost:3000/) to see the frontend.
- For backend, the server runs at
  [http://localhost:3000](http://localhost:3000/)

- Sign up & explore the features, and start using the platform!

## Screenshots

![Home Page](https://link-to-screenshot.png)
_Home page view of the social media app_

![Real-Time Chat](https://link-to-chat-screenshot.png)
_Real-time messaging between users_

## API Reference Chart

This will provides comprehensive information about all available endpoints, their functionality, and usage.

## Authentication Endpoints

| Method | Endpoint             | Description       | Request Body                    | Response          |
| ------ | -------------------- | ----------------- | ------------------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user | `{ userName, email, password }` | `{ user, token }` |
| POST   | `/api/auth/login`    | Login user        | `{ email, password }`           | `{ user, token }` |
| POST   | `/api/auth/logout`   | Logout user       | -                               | `{ message }`     |

## User Endpoints

| Method | Endpoint                | Description              | Request Body          | Response      |
| ------ | ----------------------- | ------------------------ | --------------------- | ------------- |
| GET    | `/api/users/profile`    | Get current user profile | -                     | `{ user }`    |
| GET    | `/api/users/:id`        | Get user by ID           | -                     | `{ user }`    |
| PUT    | `/api/users/profile`    | Update profile           | `{ bio, profilePic }` | `{ user }`    |
| DELETE | `/api/users/delete`     | Delete account           | -                     | `{ message }` |
| GET    | `/api/users/suggested`  | Get suggested users      | -                     | `{ users }`   |
| POST   | `/api/users/:id/follow` | Follow/Unfollow user     | -                     | `{ message }` |

## Post Endpoints

| Method | Endpoint                             | Description      | Request Body         | Response      |
| ------ | ------------------------------------ | ---------------- | -------------------- | ------------- |
| GET    | `/api/posts`                         | Get feed posts   | -                    | `{ posts }`   |
| GET    | `/api/posts/:id`                     | Get post by ID   | -                    | `{ post }`    |
| POST   | `/api/posts`                         | Create post      | `{ caption, image }` | `{ post }`    |
| DELETE | `/api/posts/:id`                     | Delete post      | -                    | `{ message }` |
| PUT    | `/api/posts/:id`                     | Update post      | `{ caption }`        | `{ post }`    |
| POST   | `/api/posts/:id/like`                | Like/Unlike post | -                    | `{ message }` |
| POST   | `/api/posts/:id/comments`            | Add comment      | `{ text }`           | `{ comment }` |
| DELETE | `/api/posts/:id/comments/:commentId` | Delete comment   | -                    | `{ message }` |

## Bookmark Endpoints

| Method | Endpoint                  | Description              | Request Body | Response      |
| ------ | ------------------------- | ------------------------ | ------------ | ------------- |
| POST   | `/api/posts/:id/bookmark` | Bookmark/Unbookmark post | -            | `{ message }` |
| GET    | `/api/users/bookmarks`    | Get bookmarked posts     | -            | `{ posts }`   |

## Search Endpoint

| Method | Endpoint            | Description  | Query Params      | Response    |
| ------ | ------------------- | ------------ | ----------------- | ----------- |
| GET    | `/api/users/search` | Search users | `q` (search term) | `{ users }` |

## Protected Routes

Important: All endpoints except `/api/auth/register` and `/api/auth/login` require authentication.

## File Upload

- Supported formats: JPG, JPEG, PNG, GIF
- Max file size: 5MB
- Images are optimized and stored on Cloudinary

## 📂 Project Structure

```
mipedia/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── features/      # Feature modules
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Redux store
│   │   └── utils/         # Utility functions
│   └── package.json
│
└── server/                # Backend application
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── models/        # Database models
    │   ├── routes/        # API routes
    │   └── utils/         # Utility functions
    └── package.json
```

## Code Structure

Welcome to the backstage of our project! Here’s an overview of how the codebase is organized:

### Project Layout

1. **Root Directory**:

   - `README.md`: This file you’re reading, providing an overview of the project.
   - `LICENSE`: The licensing information for the project.
   - `package.json`: Project configuration files depending on the language and build system.
   - `src/`: Contains the source code for the project.

### Additional Notes

- **Branching Strategy**: Our Git workflow involves branches for features, bugs, and releases. Refer to our [Git Flow](https://github.com/your-repo/git-flow) guide for details.
- **Code Style**: We follow specific coding conventions to maintain consistency. See our [Style Guide](https://github.com/your-repo/style-guide) for more information.

This structure is designed to help maintain clarity and organization as the project evolves. Feel free to explore and familiarize yourself with our codebase!

## File Structure

Here’s a guide to the essential files and directories in our project:

- **`README.md`**: Overview and documentation of the project.
- **`src/`**: Contains the main source code.
  - **`index.js`**: Entry point of the application.
  - **`components/`**: Reusable components.
- **`config/`**: Configuration files for different environments.

This map will help you navigate the project and locate key files with ease

## Contributing

We’re thrilled that you’re interested in contributing to our project! Here’s how you can get involved:

### How to Contribute

1. **Submit Issues**:

   - If you encounter any bugs or have suggestions for improvements, please submit an issue on our [GitHub Issues](https://github.com/your-repo/issues) page.
   - Provide as much detail as possible, including steps to reproduce and screenshots if applicable.

2. **Propose Features**:

   - Have a great idea for a new feature? Open a feature request issue in the same [GitHub Issues](https://github.com/your-repo/issues) page.
   - Describe the feature in detail and explain how it will benefit the project.

3. **Submit Pull Requests**:
   - Fork the repository and create a new branch for your changes.
   - Make your modifications and test thoroughly.
   - Open a pull request against the `main` branch of the original repository. Include a clear description of your changes and any relevant context.

### Coding Standards

To maintain the quality of the codebase, please follow these guidelines:

- **Code Style**: Adhere to our [code style guide](https://github.com/your-repo/style-guide) (e.g., indentation, naming conventions).
- **Documentation**: Update documentation as necessary to reflect any changes.
- **Testing**: Ensure that your changes do not break existing functionality and that new code is covered by tests.

## 📜 License

This project is licensed under the [MIT License](LICENSE). See the `LICENSE` file for more details on terms and conditions.

Feel free to use and contribute to the project under these terms!

## 👥 Team

- **Ilias Ahmed** - _Project Lead_ - [![LinkedIn](https://img.shields.io/badge/-LinkedIn-blue?logo=linkedin&logoColor=white&style=flat-square)](https://www.linkedin.com/in/ilias-ahmed9613/)

## 📬 Contact

Have questions? Reach out!

- Email: [m.iliasahmed143@gmail.com](mailto:m.iliasahmed143@gmail.com)
- LinkedIn: [Ilias Ahmed](https://www.linkedin.com/in/ilias-ahmed9613/)
- Project Link: [https://github.com/yourusername/mipedia](https://github.com/yourusername/mipedia)

## 🙏 Acknowledgments

- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)

---

## 📬Getting Help:

For additional support or questions, please contact me or refer to the full documentation.

👤Author: _Ilias Ahmed_: If you have any questions or need assistance, feel free to reach out to us via [![LinkedIn](https://img.shields.io/badge/-LinkedIn-blue?logo=linkedin&logoColor=white&style=flat-square)](https://www.linkedin.com/in/ilias-ahmed9613/) or contact us directly at [![Email](https://img.shields.io/badge/-Email-red?logo=gmail&logoColor=white&style=flat-square)](mailto:m.iliasahmed143@gmail.com).

Thank you 🫂 for your interest in contributing! Your involvement helps make this project better for everyone.

## Live Demo

[Live Demo](https://project-live-demo.example.com/)

## Related Projects

Here are some related projects:

[Related Project 1](https://github.com/username/related-project-1)
[Related Project 2](https://github.com/username/related-project-2)

---

<div align="center">

Made with ❤️ by [Ilias Ahmed](https://github.com/yourusername)

[![Contributors](https://contrib.rocks/image?repo=username/repository)](https://github.com/username/repository/graphs/contributors)

</div>
