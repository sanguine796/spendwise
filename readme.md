# SpendWise 💰

**SpendWise** is a full-stack personal expense tracker built to help users record, manage, and analyze their daily expenses.

It uses a simple frontend with a Node.js/Express backend and MySQL database.

## 🚀 Features

### 📊 Dashboard

* Total spending
* Current month spending
* Today's spending
* Transaction count
* Highest and lowest spending
* Recent expenses
* Spending by category
* Financial spending insight

### 💳 Expense Management

* Add expenses
* Edit expenses
* Delete expenses
* Search expenses
* Filter by category
* Filter by date range

### 📈 Reports

* Monthly spending reports
* Category-wise spending reports
* Payment-method spending reports

### 🗄️ Database

* MySQL database
* Persistent expense storage
* REST API-based communication

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js
* REST API
* CORS

### Database

* MySQL

### Tools

* VS Code
* Git
* GitHub

## 📁 Project Structure

```text
SpendWise/
│
├── spendwise.html
├── style.css
├── script.js
│
├── server.js
├── package.json
├── package-lock.json
│
└── README.md
```

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/spendwise.git
cd spendwise
```

### 2. Install dependencies

```bash
npm install
```

The backend uses:

* Express
* CORS
* MySQL2

### 3. Create the MySQL database

Run the following SQL in MySQL Workbench or the MySQL command line:

```sql
CREATE DATABASE spendwise;

USE spendwise;

CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    notes TEXT
);
```

### 4. Configure MySQL

Update the database connection in `server.js`:

```js
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "YOUR_MYSQL_PASSWORD",
    database: "spendwise"
});
```

Replace `YOUR_MYSQL_PASSWORD` with your local MySQL password.

### 5. Start the backend

```bash
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

### 6. Open the application

Open:

```text
spendwise.html
```

in your browser.

## 🔌 API Endpoints

| Method | Endpoint                | Description          |
| ------ | ----------------------- | -------------------- |
| GET    | `/api/expenses`         | Get all expenses     |
| GET    | `/api/expenses/:id`     | Get a single expense |
| POST   | `/api/expenses`         | Add a new expense    |
| PUT    | `/api/expenses/:id`     | Update an expense    |
| DELETE | `/api/expenses/:id`     | Delete an expense    |
| GET    | `/api/expenses/reports` | Get spending reports |

## 📊 Expense Categories

* Food
* Travel
* Shopping
* Bills
* Education
* Entertainment
* Other

## 💳 Payment Methods

* Cash
* UPI
* Debit Card
* Credit Card
* Bank Transfer
* Other

## 🧠 Financial Insights

SpendWise provides simple spending insights based on the user's actual expense data.

For example, the dashboard can identify the highest spending category and provide a basic recommendation based on the user's spending pattern.

## 🔄 How It Works

```text
User
  ↓
HTML / CSS / JavaScript
  ↓
Express REST API
  ↓
MySQL Database
  ↓
Expense Data
  ↓
Dashboard & Reports
```

## 🎯 Project Goals

This project was built to practice:

* JavaScript
* REST API development
* Express.js
* MySQL
* SQL queries
* CRUD operations
* Frontend development
* Client-server communication
* Data filtering and reporting

## 🔮 Future Improvements

* User authentication
* Monthly budgets
* Expense export
* Interactive charts
* Recurring expenses
* Cloud deployment

## 👨‍💻 Author

**Sanguine Nerella**

B.Tech Computer Science & Engineering Student
