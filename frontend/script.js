/* =========================================================
   SPENDWISE
   Personal Expense Tracker
   ========================================================= */

const API_URL = "http://localhost:5000/api/expenses";

let expenses = [];
let editingExpenseId = null;

const categories = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Education",
    "Entertainment",
    "Other"
];


/* =========================================================
   LIGHT / DARK MODE
   ========================================================= */

function initializeTheme() {

    const themeToggle =
        document.getElementById("theme-toggle");

    if (!themeToggle) {
        return;
    }


    const savedTheme =
        localStorage.getItem("spendwise-theme");


    if (savedTheme === "dark") {

        document.body.classList.add("dark-mode");

        themeToggle.textContent = "☀️";
        themeToggle.setAttribute(
            "aria-label",
            "Switch to light mode"
        );
        themeToggle.setAttribute(
            "title",
            "Switch to light mode"
        );

    } else {

        document.body.classList.remove("dark-mode");

        themeToggle.textContent = "🌙";
        themeToggle.setAttribute(
            "aria-label",
            "Switch to dark mode"
        );
        themeToggle.setAttribute(
            "title",
            "Switch to dark mode"
        );
    }


    themeToggle.addEventListener(
        "click",
        () => {

            const darkMode =
                document.body.classList.toggle("dark-mode");


            if (darkMode) {

                localStorage.setItem(
                    "spendwise-theme",
                    "dark"
                );

                themeToggle.textContent = "☀️";

                themeToggle.setAttribute(
                    "aria-label",
                    "Switch to light mode"
                );

                themeToggle.setAttribute(
                    "title",
                    "Switch to light mode"
                );

            } else {

                localStorage.setItem(
                    "spendwise-theme",
                    "light"
                );

                themeToggle.textContent = "🌙";

                themeToggle.setAttribute(
                    "aria-label",
                    "Switch to dark mode"
                );

                themeToggle.setAttribute(
                    "title",
                    "Switch to dark mode"
                );
            }
        }
    );
}

/* =========================================================
   BASIC HELPERS
   ========================================================= */

function formatAmount(amount) {
    const value = Number(amount) || 0;

    return value.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    });
}


function getDateOnly(value) {
    if (!value) {
        return "";
    }

    return String(value).slice(0, 10);
}


function formatDate(value) {
    const dateString = getDateOnly(value);

    if (!dateString) {
        return "-";
    }

    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getTodayString() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showSection(sectionId) {

    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
    });

    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active");
    }


    document.querySelectorAll(".nav-link").forEach(button => {

        button.classList.remove("active");

        if (button.dataset.section === sectionId) {
            button.classList.add("active");
        }

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (sectionId === "reports") {
        loadReports();
    }
}


/* =========================================================
   CATEGORY FILTER
   ========================================================= */

function populateCategoryFilters() {

    const filter = document.getElementById("filter-category");

    if (!filter) {
        return;
    }

    filter.innerHTML = `
        <option value="">All Categories</option>
        ${categories.map(category => `
            <option value="${escapeHtml(category)}">
                ${escapeHtml(category)}
            </option>
        `).join("")}
    `;
}


/* =========================================================
   LOAD EXPENSES
   ========================================================= */

async function loadExpenses() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load expenses.");
        }

        expenses = await response.json();

        if (!Array.isArray(expenses)) {
            expenses = [];
        }

        renderExpenses();
        updateDashboard();

    } catch (error) {

        console.error("Error loading expenses:", error);

        expenses = [];

        renderExpenses();
        updateDashboard();

        alert(
            "Could not connect to the SpendWise server. " +
            "Make sure your Node.js server is running on port 5000."
        );
    }
}


/* =========================================================
   FILTER EXPENSES
   ========================================================= */

function getFilteredExpenses() {

    const searchInput =
        document.getElementById("search-expenses");

    const categoryInput =
        document.getElementById("filter-category");

    const fromInput =
        document.getElementById("filter-date-from");

    const toInput =
        document.getElementById("filter-date-to");


    const search = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const category = categoryInput
        ? categoryInput.value
        : "";

    const fromDate = fromInput
        ? fromInput.value
        : "";

    const toDate = toInput
        ? toInput.value
        : "";


    return expenses.filter(expense => {

        const name =
            String(expense.name || "").toLowerCase();

        const expenseCategory =
            String(expense.category || "");

        const expenseDate =
            getDateOnly(expense.date);


        const matchesSearch =
            !search ||
            name.includes(search) ||
            expenseCategory.toLowerCase().includes(search) ||
            String(expense.payment_method || "")
                .toLowerCase()
                .includes(search);


        const matchesCategory =
            !category ||
            expenseCategory === category;


        const matchesFrom =
            !fromDate ||
            expenseDate >= fromDate;


        const matchesTo =
            !toDate ||
            expenseDate <= toDate;


        return (
            matchesSearch &&
            matchesCategory &&
            matchesFrom &&
            matchesTo
        );
    });
}


/* =========================================================
   RENDER EXPENSE TABLE
   ========================================================= */

function renderExpenses() {

    const tableBody =
        document.getElementById("expenses-table-body");

    const emptyState =
        document.getElementById("no-expenses");


    if (!tableBody) {
        return;
    }


    const filteredExpenses = getFilteredExpenses();


    if (filteredExpenses.length === 0) {

        tableBody.innerHTML = "";

        if (emptyState) {
            emptyState.classList.add("visible");
        }

        return;
    }


    if (emptyState) {
        emptyState.classList.remove("visible");
    }


    tableBody.innerHTML = filteredExpenses.map(expense => {

        return `
            <tr>

                <td>
                    ${escapeHtml(formatDate(expense.date))}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(expense.name)}
                    </strong>
                </td>

                <td>
                    <span class="category-badge">
                        ${escapeHtml(expense.category)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(expense.payment_method)}
                </td>

                <td class="amount-cell">
                    ${formatAmount(expense.amount)}
                </td>

                <td>

                    <div class="action-group">

                        <button
                            class="small-button"
                            onclick="editExpense(${expense.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="small-button delete-button"
                            onclick="deleteExpense(${expense.id})"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");
}


/* =========================================================
   FILTER EVENT
   ========================================================= */

function applyFilters() {
    renderExpenses();
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const totalSpent =
        expenses.reduce(
            (sum, expense) => sum + Number(expense.amount || 0),
            0
        );


    const transactionCount =
        expenses.length;


    const today =
        getTodayString();


    const todaySpent =
        expenses
            .filter(expense => getDateOnly(expense.date) === today)
            .reduce(
                (sum, expense) => sum + Number(expense.amount || 0),
                0
            );


    const now = new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth() + 1;


    const currentMonthExpenses =
        expenses.filter(expense => {

            const date = getDateOnly(expense.date);

            if (!date) {
                return false;
            }

            const parts = date.split("-");

            return (
                Number(parts[0]) === currentYear &&
                Number(parts[1]) === currentMonth
            );
        });


    const monthSpent =
        currentMonthExpenses.reduce(
            (sum, expense) => sum + Number(expense.amount || 0),
            0
        );


    const totalElement =
        document.getElementById("total-spent");

    const monthElement =
        document.getElementById("month-spent");

    const todayElement =
        document.getElementById("today-spent");

    const countElement =
        document.getElementById("transaction-count");


    if (totalElement) {
        totalElement.textContent =
            formatAmount(totalSpent);
    }

    if (monthElement) {
        monthElement.textContent =
            formatAmount(monthSpent);
    }

    if (todayElement) {
        todayElement.textContent =
            formatAmount(todaySpent);
    }

    if (countElement) {
        countElement.textContent =
            transactionCount;
    }


    updateSpendingAnalysis();
    renderRecentExpenses();
    renderCurrentMonth();
    renderMonthlySpending();
    renderCategorySummary();
    renderFinancialInsight();
}


/* =========================================================
   SPENDING ANALYSIS
   ========================================================= */

function updateSpendingAnalysis() {

    const highestElement =
        document.getElementById("highest-spending");

    const highestCategoryElement =
        document.getElementById("highest-spending-category");

    const lowestElement =
        document.getElementById("lowest-spending");

    const lowestCategoryElement =
        document.getElementById("lowest-spending-category");

    const averageElement =
        document.getElementById("average-spending");


    if (expenses.length === 0) {

        if (highestElement) {
            highestElement.textContent = "₹0.00";
        }

        if (highestCategoryElement) {
            highestCategoryElement.textContent =
                "No expenses yet";
        }

        if (lowestElement) {
            lowestElement.textContent = "₹0.00";
        }

        if (lowestCategoryElement) {
            lowestCategoryElement.textContent =
                "No expenses yet";
        }

        if (averageElement) {
            averageElement.textContent = "₹0.00";
        }

        return;
    }


    const sorted =
        [...expenses].sort(
            (a, b) =>
                Number(b.amount) - Number(a.amount)
        );


    const highest =
        sorted[0];


    const lowest =
        sorted[sorted.length - 1];


    const total =
        expenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount || 0),
            0
        );


    const average =
        total / expenses.length;


    if (highestElement) {
        highestElement.textContent =
            formatAmount(highest.amount);
    }

    if (highestCategoryElement) {
        highestCategoryElement.textContent =
            `${highest.category} · ${highest.name}`;
    }


    if (lowestElement) {
        lowestElement.textContent =
            formatAmount(lowest.amount);
    }

    if (lowestCategoryElement) {
        lowestCategoryElement.textContent =
            `${lowest.category} · ${lowest.name}`;
    }


    if (averageElement) {
        averageElement.textContent =
            formatAmount(average);
    }
}


/* =========================================================
   RECENT EXPENSES
   ========================================================= */

function renderRecentExpenses() {

    const body =
        document.getElementById("recent-expenses-body");

    const empty =
        document.getElementById("recent-empty");


    if (!body) {
        return;
    }


    const recent =
        [...expenses]
            .sort(
                (a, b) =>
                    getDateOnly(b.date).localeCompare(
                        getDateOnly(a.date)
                    ) ||
                    Number(b.id) - Number(a.id)
            )
            .slice(0, 6);


    if (recent.length === 0) {

        body.innerHTML = "";

        if (empty) {
            empty.classList.add("visible");
        }

        return;
    }


    if (empty) {
        empty.classList.remove("visible");
    }


    body.innerHTML = recent.map(expense => {

        return `
            <tr>

                <td>
                    ${escapeHtml(formatDate(expense.date))}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(expense.name)}
                    </strong>
                </td>

                <td>
                    <span class="category-badge">
                        ${escapeHtml(expense.category)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(expense.payment_method)}
                </td>

                <td class="amount-cell">
                    ${formatAmount(expense.amount)}
                </td>

            </tr>
        `;

    }).join("");
}


/* =========================================================
   CURRENT MONTH
   ========================================================= */

function renderCurrentMonth() {

    const monthNameElement =
        document.getElementById("current-month-name");

    const totalElement =
        document.getElementById("current-month-total");

    const countElement =
        document.getElementById("monthly-transaction-count");

    const averageElement =
        document.getElementById("monthly-average");


    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        now.getMonth();


    const monthExpenses =
        expenses.filter(expense => {

            const date = getDateOnly(expense.date);

            if (!date) {
                return false;
            }

            const expenseDate =
                new Date(`${date}T00:00:00`);

            return (
                expenseDate.getFullYear() === year &&
                expenseDate.getMonth() === month
            );
        });


    const total =
        monthExpenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount || 0),
            0
        );


    const average =
        monthExpenses.length > 0
            ? total / monthExpenses.length
            : 0;


    if (monthNameElement) {

        monthNameElement.textContent =
            now.toLocaleString("en-IN", {
                month: "long",
                year: "numeric"
            });
    }


    if (totalElement) {
        totalElement.textContent =
            formatAmount(total);
    }


    if (countElement) {
        countElement.textContent =
            monthExpenses.length;
    }


    if (averageElement) {
        averageElement.textContent =
            formatAmount(average);
    }
}


/* =========================================================
   MONTHLY SPENDING
   ========================================================= */

function renderMonthlySpending() {

    const container =
        document.getElementById("monthly-spending-list");


    if (!container) {
        return;
    }


    if (expenses.length === 0) {

        container.innerHTML = `
            <div class="empty-state visible">
                <p>No monthly spending data available yet.</p>
            </div>
        `;

        return;
    }


    const monthlyTotals = {};


    expenses.forEach(expense => {

        const date =
            getDateOnly(expense.date);

        if (!date) {
            return;
        }

        const monthKey =
            date.slice(0, 7);

        if (!monthlyTotals[monthKey]) {
            monthlyTotals[monthKey] = 0;
        }

        monthlyTotals[monthKey] +=
            Number(expense.amount || 0);
    });


    const months =
        Object.entries(monthlyTotals)
            .sort((a, b) =>
                b[0].localeCompare(a[0])
            )
            .slice(0, 6);


    const maxAmount =
        Math.max(
            ...months.map(item => item[1]),
            1
        );


    container.innerHTML =
        months.map(([month, amount]) => {

            const percentage =
                (amount / maxAmount) * 100;


            const date =
                new Date(`${month}-01T00:00:00`);


            const monthName =
                date.toLocaleString("en-IN", {
                    month: "short",
                    year: "numeric"
                });


            return `
                <div class="month-row">

                    <span class="month-name">
                        ${escapeHtml(monthName)}
                    </span>

                    <div class="month-bar">
                        <div
                            class="month-bar-fill"
                            style="width: ${percentage}%"
                        ></div>
                    </div>

                    <span class="month-amount">
                        ${formatAmount(amount)}
                    </span>

                </div>
            `;

        }).join("");
}


/* =========================================================
   CATEGORY SUMMARY
   ========================================================= */

function renderCategorySummary() {

    const container =
        document.getElementById("category-summary");


    if (!container) {
        return;
    }


    if (expenses.length === 0) {

        container.innerHTML = `
            <div class="empty-state visible">
                <p>No category spending data available yet.</p>
            </div>
        `;

        return;
    }


    const categoryTotals = {};


    expenses.forEach(expense => {

        const category =
            expense.category || "Other";


        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }


        categoryTotals[category] +=
            Number(expense.amount || 0);
    });


    const rows =
        Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);


    const maxAmount =
        Math.max(
            ...rows.map(item => item[1]),
            1
        );


    container.innerHTML =
        rows.map(([category, amount]) => {

            const percentage =
                (amount / maxAmount) * 100;


            return `
                <div class="category-row">

                    <span class="category-name">
                        ${escapeHtml(category)}
                    </span>

                    <div class="category-bar">

                        <div
                            class="category-bar-fill"
                            style="width: ${percentage}%"
                        ></div>

                    </div>

                    <span class="category-amount">
                        ${formatAmount(amount)}
                    </span>

                </div>
            `;

        }).join("");
}


/* =========================================================
   FINANCIAL INSIGHT
   ========================================================= */

function renderFinancialInsight() {

    const element =
        document.getElementById("financial-insight-text");


    if (!element) {
        return;
    }


    if (expenses.length === 0) {

        element.textContent =
            "Add some expenses and SpendWise will generate a spending insight based on your actual data.";

        return;
    }


    const categoryTotals = {};


    expenses.forEach(expense => {

        const category =
            expense.category || "Other";


        categoryTotals[category] =
            (categoryTotals[category] || 0) +
            Number(expense.amount || 0);
    });


    const sortedCategories =
        Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);


    const topCategory =
        sortedCategories[0];


    const total =
        expenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount || 0),
            0
        );


    if (!topCategory || total <= 0) {

        element.textContent =
            "There is not enough spending data yet to generate an insight.";

        return;
    }


    const topPercentage =
        (topCategory[1] / total) * 100;


    const tenPercentSaving =
        total * 0.10;


    if (topPercentage >= 40) {

        element.textContent =
            `${topCategory[0]} is currently your highest spending category, accounting for ${topPercentage.toFixed(1)}% of your recorded spending. Reviewing this category could have the biggest impact on your overall spending.`;

    } else {

        element.textContent =
            `${topCategory[0]} is your highest spending category at ${formatAmount(topCategory[1])}. Your recorded spending totals ${formatAmount(total)}. Reducing discretionary expenses by around 10% could potentially free up about ${formatAmount(tenPercentSaving)} based on your current data.`;

    }
}


/* =========================================================
   REPORTS
   ========================================================= */

async function loadReports() {

    try {

        const response =
            await fetch(`${API_URL}/reports`);


        if (!response.ok) {
            throw new Error("Unable to load reports.");
        }


        const reports =
            await response.json();


        renderReports(reports);

    } catch (error) {

        console.error(
            "Error loading reports:",
            error
        );

        renderReports({
            monthly: [],
            category: [],
            payment: []
        });
    }
}


/* =========================================================
   RENDER REPORTS
   ========================================================= */

function renderReports(reports) {

    const monthlyBody =
        document.getElementById("monthly-report-body");

    const categoryBody =
        document.getElementById("category-report-body");

    const paymentBody =
        document.getElementById("payment-report-body");


    if (monthlyBody) {

        if (!reports.monthly ||
            reports.monthly.length === 0) {

            monthlyBody.innerHTML = `
                <tr>
                    <td colspan="3">
                        No monthly data available.
                    </td>
                </tr>
            `;

        } else {

            monthlyBody.innerHTML =
                reports.monthly.map(row => {

                    const date =
                        new Date(`${row.month}-01T00:00:00`);

                    const monthName =
                        date.toLocaleString("en-IN", {
                            month: "long",
                            year: "numeric"
                        });


                    return `
                        <tr>

                            <td>
                                ${escapeHtml(monthName)}
                            </td>

                            <td>
                                ${Number(row.transactions)}
                            </td>

                            <td class="amount-cell">
                                ${formatAmount(row.total)}
                            </td>

                        </tr>
                    `;

                }).join("");
        }
    }


    if (categoryBody) {

        if (!reports.category ||
            reports.category.length === 0) {

            categoryBody.innerHTML = `
                <tr>
                    <td colspan="3">
                        No category data available.
                    </td>
                </tr>
            `;

        } else {

            categoryBody.innerHTML =
                reports.category.map(row => {

                    return `
                        <tr>

                            <td>
                                <span class="category-badge">
                                    ${escapeHtml(row.category)}
                                </span>
                            </td>

                            <td>
                                ${Number(row.transactions)}
                            </td>

                            <td class="amount-cell">
                                ${formatAmount(row.total)}
                            </td>

                        </tr>
                    `;

                }).join("");
        }
    }


    if (paymentBody) {

        if (!reports.payment ||
            reports.payment.length === 0) {

            paymentBody.innerHTML = `
                <tr>
                    <td colspan="3">
                        No payment data available.
                    </td>
                </tr>
            `;

        } else {

            paymentBody.innerHTML =
                reports.payment.map(row => {

                    return `
                        <tr>

                            <td>
                                ${escapeHtml(row.payment_method)}
                            </td>

                            <td>
                                ${Number(row.transactions)}
                            </td>

                            <td class="amount-cell">
                                ${formatAmount(row.total)}
                            </td>

                        </tr>
                    `;

                }).join("");
        }
    }
}


/* =========================================================
   ADD / UPDATE EXPENSE
   ========================================================= */

async function addOrUpdateExpense(event) {

    event.preventDefault();


    const name =
        document.getElementById("expense-name")
            .value.trim();


    const amount =
        Number(
            document.getElementById("expense-amount")
                .value
        );


    const category =
        document.getElementById("expense-category")
            .value;


    const date =
        document.getElementById("expense-date")
            .value;


    const paymentMethod =
        document.getElementById("payment-method")
            .value;


    const notes =
        document.getElementById("expense-notes")
            .value.trim();


    if (!name ||
        !amount ||
        amount <= 0 ||
        !category ||
        !date ||
        !paymentMethod) {

        alert("Please fill in all required fields correctly.");

        return;
    }


    const data = {

        name,

        amount,

        category,

        date,

        payment_method: paymentMethod,

        notes: notes || null

    };


    try {

        let response;


        if (editingExpenseId) {

            response =
                await fetch(
                    `${API_URL}/${editingExpenseId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(data)
                    }
                );

        } else {

            response =
                await fetch(
                    API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(data)
                    }
                );
        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to save expense."
            );
        }


        alert(
            editingExpenseId
                ? "Expense updated successfully."
                : "Expense added successfully."
        );


        resetExpenseForm();


        await loadExpenses();

        await loadReports();


        showSection("dashboard");


    } catch (error) {

        console.error(
            "Error saving expense:",
            error
        );

        alert(
            error.message ||
            "Something went wrong while saving the expense."
        );
    }
}


/* =========================================================
   EDIT EXPENSE
   ========================================================= */

function editExpense(id) {

    const expense =
        expenses.find(
            item => Number(item.id) === Number(id)
        );


    if (!expense) {
        return;
    }


    editingExpenseId =
        Number(id);


    document.getElementById("expense-name").value =
        expense.name || "";


    document.getElementById("expense-amount").value =
        expense.amount || "";


    document.getElementById("expense-category").value =
        expense.category || "";


    document.getElementById("expense-date").value =
        getDateOnly(expense.date);


    document.getElementById("payment-method").value =
        expense.payment_method || "";


    document.getElementById("expense-notes").value =
        expense.notes || "";


    document.getElementById("expense-submit-btn")
        .textContent =
        "Update Expense";


    showSection("add-expense");
}


/* =========================================================
   DELETE EXPENSE
   ========================================================= */

async function deleteExpense(id) {

    const expense =
        expenses.find(
            item => Number(item.id) === Number(id)
        );


    if (!expense) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${expense.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to delete expense."
            );
        }


        await loadExpenses();

        await loadReports();


    } catch (error) {

        console.error(
            "Error deleting expense:",
            error
        );

        alert(
            error.message ||
            "Something went wrong while deleting the expense."
        );
    }
}


/* =========================================================
   RESET FORM
   ========================================================= */

function resetExpenseForm() {

    const form =
        document.getElementById("expense-form");


    if (form) {
        form.reset();
    }


    editingExpenseId = null;


    const submitButton =
        document.getElementById("expense-submit-btn");


    if (submitButton) {
        submitButton.textContent =
            "Add Expense";
    }


    const dateInput =
        document.getElementById("expense-date");


    if (dateInput) {
        dateInput.value =
            getTodayString();
    }
}


/* =========================================================
   INITIALIZE APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeTheme();
        populateCategoryFilters();


        document.querySelectorAll(".nav-link")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {
                        showSection(
                            button.dataset.section
                        );
                    }
                );

            });


        const expenseForm =
            document.getElementById("expense-form");


        if (expenseForm) {

            expenseForm.addEventListener(
                "submit",
                addOrUpdateExpense
            );
        }


        const clearExpenseButton =
            document.getElementById("clear-expense-btn");


        if (clearExpenseButton) {

            clearExpenseButton.addEventListener(
                "click",
                resetExpenseForm
            );
        }


        const searchInput =
            document.getElementById("search-expenses");


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                applyFilters
            );
        }


        const categoryFilter =
            document.getElementById("filter-category");


        if (categoryFilter) {

            categoryFilter.addEventListener(
                "change",
                applyFilters
            );
        }


        const fromFilter =
            document.getElementById("filter-date-from");


        if (fromFilter) {

            fromFilter.addEventListener(
                "change",
                applyFilters
            );
        }


        const toFilter =
            document.getElementById("filter-date-to");


        if (toFilter) {

            toFilter.addEventListener(
                "change",
                applyFilters
            );
        }


        const clearFiltersButton =
            document.getElementById("clear-filters-btn");


        if (clearFiltersButton) {

            clearFiltersButton.addEventListener(
                "click",
                () => {

                    document.getElementById(
                        "search-expenses"
                    ).value = "";

                    document.getElementById(
                        "filter-category"
                    ).value = "";

                    document.getElementById(
                        "filter-date-from"
                    ).value = "";

                    document.getElementById(
                        "filter-date-to"
                    ).value = "";

                    renderExpenses();
                }
            );
        }


        resetExpenseForm();

        loadExpenses();

    }
);