const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 5000;


/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(cors());
app.use(express.json());


/* =========================================================
   MYSQL DATABASE CONNECTION
   ========================================================= */

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "MyNewPassword123!",
    database: "spendwise"
});


db.connect((error) => {

    if (error) {
        console.error("MySQL connection failed:", error.message);
        return;
    }

    console.log("Connected to MySQL database: spendwise");

});


/* =========================================================
   GET ALL EXPENSES
   GET /api/expenses
   ========================================================= */

app.get("/api/expenses", (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            amount,
            category,
            date,
            payment_method,
            notes
        FROM expenses
        ORDER BY date DESC, id DESC
    `;


    db.query(sql, (error, results) => {

        if (error) {

            console.error(
                "Error fetching expenses:",
                error.message
            );

            return res.status(500).json({
                message: "Failed to fetch expenses"
            });
        }


        res.json(results);

    });

});


/* =========================================================
   GET REPORTS
   IMPORTANT:
   This route must come BEFORE /api/expenses/:id
   ========================================================= */

app.get("/api/expenses/reports", (req, res) => {

    const monthlySql = `
        SELECT
            DATE_FORMAT(date, '%Y-%m') AS month,
            ROUND(SUM(amount), 2) AS total,
            COUNT(*) AS transactions
        FROM expenses
        GROUP BY DATE_FORMAT(date, '%Y-%m')
        ORDER BY month DESC
    `;


    const categorySql = `
        SELECT
            category,
            ROUND(SUM(amount), 2) AS total,
            COUNT(*) AS transactions
        FROM expenses
        GROUP BY category
        ORDER BY total DESC
    `;


    const paymentSql = `
        SELECT
            payment_method,
            ROUND(SUM(amount), 2) AS total,
            COUNT(*) AS transactions
        FROM expenses
        GROUP BY payment_method
        ORDER BY total DESC
    `;


    db.query(monthlySql, (monthlyError, monthlyResults) => {

        if (monthlyError) {

            console.error(
                "Monthly report error:",
                monthlyError.message
            );

            return res.status(500).json({
                message: "Failed to generate monthly report"
            });
        }


        db.query(
            categorySql,
            (categoryError, categoryResults) => {

                if (categoryError) {

                    console.error(
                        "Category report error:",
                        categoryError.message
                    );

                    return res.status(500).json({
                        message: "Failed to generate category report"
                    });
                }


                db.query(
                    paymentSql,
                    (paymentError, paymentResults) => {

                        if (paymentError) {

                            console.error(
                                "Payment report error:",
                                paymentError.message
                            );

                            return res.status(500).json({
                                message:
                                    "Failed to generate payment report"
                            });
                        }


                        res.json({

                            monthly: monthlyResults,

                            category: categoryResults,

                            payment: paymentResults

                        });

                    }
                );

            }
        );

    });

});


/* =========================================================
   GET ONE EXPENSE
   GET /api/expenses/:id
   ========================================================= */

app.get("/api/expenses/:id", (req, res) => {

    const id = Number(req.params.id);


    if (!Number.isInteger(id)) {

        return res.status(400).json({
            message: "Invalid expense ID"
        });
    }


    const sql = `
        SELECT
            id,
            name,
            amount,
            category,
            date,
            payment_method,
            notes
        FROM expenses
        WHERE id = ?
    `;


    db.query(sql, [id], (error, results) => {

        if (error) {

            console.error(
                "Error fetching expense:",
                error.message
            );

            return res.status(500).json({
                message: "Failed to fetch expense"
            });
        }


        if (results.length === 0) {

            return res.status(404).json({
                message: "Expense not found"
            });
        }


        res.json(results[0]);

    });

});


/* =========================================================
   ADD EXPENSE
   POST /api/expenses
   ========================================================= */

app.post("/api/expenses", (req, res) => {

    const {
        name,
        amount,
        category,
        date,
        payment_method,
        notes
    } = req.body;


    /* -------------------------
       VALIDATION
       ------------------------- */

    if (
        !name ||
        amount === undefined ||
        amount === null ||
        !category ||
        !date ||
        !payment_method
    ) {

        return res.status(400).json({
            message:
                "Name, amount, category, date and payment method are required"
        });
    }


    const numericAmount = Number(amount);


    if (
        Number.isNaN(numericAmount) ||
        numericAmount <= 0
    ) {

        return res.status(400).json({
            message: "Amount must be greater than zero"
        });
    }


    /* -------------------------
       INSERT
       ------------------------- */

    const sql = `
        INSERT INTO expenses
        (
            name,
            amount,
            category,
            date,
            payment_method,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;


    const values = [
        String(name).trim(),
        numericAmount,
        String(category).trim(),
        date,
        String(payment_method).trim(),
        notes ? String(notes).trim() : null
    ];


    db.query(
        sql,
        values,
        (error, result) => {

            if (error) {

                console.error(
                    "Error adding expense:",
                    error.message
                );

                return res.status(500).json({
                    message: "Failed to add expense"
                });
            }


            res.status(201).json({

                message: "Expense added successfully",

                expenseId: result.insertId

            });

        }
    );

});


/* =========================================================
   UPDATE EXPENSE
   PUT /api/expenses/:id
   ========================================================= */

app.put("/api/expenses/:id", (req, res) => {

    const id = Number(req.params.id);


    if (!Number.isInteger(id)) {

        return res.status(400).json({
            message: "Invalid expense ID"
        });
    }


    const {
        name,
        amount,
        category,
        date,
        payment_method,
        notes
    } = req.body;


    /* -------------------------
       VALIDATION
       ------------------------- */

    if (
        !name ||
        amount === undefined ||
        amount === null ||
        !category ||
        !date ||
        !payment_method
    ) {

        return res.status(400).json({
            message:
                "Name, amount, category, date and payment method are required"
        });
    }


    const numericAmount = Number(amount);


    if (
        Number.isNaN(numericAmount) ||
        numericAmount <= 0
    ) {

        return res.status(400).json({
            message: "Amount must be greater than zero"
        });
    }


    /* -------------------------
       UPDATE
       ------------------------- */

    const sql = `
        UPDATE expenses
        SET
            name = ?,
            amount = ?,
            category = ?,
            date = ?,
            payment_method = ?,
            notes = ?
        WHERE id = ?
    `;


    const values = [

        String(name).trim(),

        numericAmount,

        String(category).trim(),

        date,

        String(payment_method).trim(),

        notes ? String(notes).trim() : null,

        id

    ];


    db.query(
        sql,
        values,
        (error, result) => {

            if (error) {

                console.error(
                    "Error updating expense:",
                    error.message
                );

                return res.status(500).json({
                    message: "Failed to update expense"
                });
            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Expense not found"
                });
            }


            res.json({

                message:
                    "Expense updated successfully"

            });

        }
    );

});


/* =========================================================
   DELETE EXPENSE
   DELETE /api/expenses/:id
   ========================================================= */

app.delete("/api/expenses/:id", (req, res) => {

    const id = Number(req.params.id);


    if (!Number.isInteger(id)) {

        return res.status(400).json({
            message: "Invalid expense ID"
        });
    }


    const sql = `
        DELETE FROM expenses
        WHERE id = ?
    `;


    db.query(
        sql,
        [id],
        (error, result) => {

            if (error) {

                console.error(
                    "Error deleting expense:",
                    error.message
                );

                return res.status(500).json({
                    message: "Failed to delete expense"
                });
            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Expense not found"
                });
            }


            res.json({

                message:
                    "Expense deleted successfully"

            });

        }
    );

});


/* =========================================================
   START SERVER
   ========================================================= */

app.listen(PORT, () => {

    console.log(
        `SpendWise backend running at http://localhost:${PORT}`
    );

});