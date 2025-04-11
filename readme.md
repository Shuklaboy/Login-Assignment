## 🚀 Quick Setup (Local System)

### 📁 1. Clone the Repository
```bash
git clone <your-repo-url>
cd <your-project-folder>
```

---

### ⚙️ 2. Backend Setup

#### a. Navigate to backend folder:
```bash
cd backend
```

#### b. Install dependencies:
```bash
npm install
```

#### c. Create a `.env` file in `backend/`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=userauth
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

#### d. Import Database:
Make sure MariaDB/MySQL is installed and running.
```bash
mysql -u your_db_user -p userauth < userauth_dump.sql
```

#### e. Start the Backend Server:
```bash
node index.js
```

---

### 🌐 3. Frontend Setup

#### a. Open a new terminal and navigate to frontend:
```bash
cd frontend
```

#### b. Install dependencies:
```bash
npm install
```

#### c. Start the Frontend Server:
```bash
npm start
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

---


### 📂 Folder Structure
```
project-folder/
│
├── backend/
│   ├── index.js
│   ├── .env
│   ├── userauth_dump.sql
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── AuthForm.js
│   │   ├── Dashboard.js
│   │   ├── ForgotPassword.js
│   │   └── ...
│   └── public/
│
└── README.md
```

