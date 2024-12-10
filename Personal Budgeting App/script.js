// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});

// Delete History Button
const deleteHistoryButton = document.getElementById('clear-history');
deleteHistoryButton.addEventListener('click', () => {
    if (confirm("Are you sure you want to delete all transaction history?")) {
        localStorage.clear(); // Clears all data from local storage
        location.reload(); // Reload the page to reflect changes
    }
});

// Transaction Data
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let totalIncome = 0;
let totalExpenses = 0;
let expenseData = {};

// Load Saved Data on Page Load
window.onload = () => {
    transactions.forEach(transaction => {
        addTransactionToTable(transaction);
        updateTotals(transaction);
    });
    updatePieChart();
};

// Update Totals (Income, Expenses, Balance)
function updateTotals(transaction) {
    if (transaction.type === 'income') {
        totalIncome += transaction.amount;
    } else {
        totalExpenses += transaction.amount;
    }
    const balance = totalIncome - totalExpenses;

    document.getElementById('income-total').textContent = `₹${totalIncome.toFixed(2)}`;
    document.getElementById('expenses-total').textContent = `₹${totalExpenses.toFixed(2)}`;
    document.getElementById('balance-total').textContent = `₹${balance.toFixed(2)}`;
}

// Add Transaction to Table
function addTransactionToTable(transaction) {
    const tableBody = document.getElementById('transaction-history');
    const row = document.createElement('tr');
    row.dataset.id = transaction.id;

    const typeCell = document.createElement('td');
    typeCell.textContent = transaction.type === 'income' ? 'Income' : 'Expense';

    const categoryCell = document.createElement('td');
    categoryCell.textContent = transaction.category;

    const amountCell = document.createElement('td');
    amountCell.textContent = `₹${transaction.amount.toFixed(2)}`;

    const actionCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-btn');
    removeButton.addEventListener('click', () => removeTransaction(transaction.id));
    actionCell.appendChild(removeButton);

    row.appendChild(typeCell);
    row.appendChild(categoryCell);
    row.appendChild(amountCell);
    row.appendChild(actionCell);
    tableBody.appendChild(row);
}

// Remove Transaction from Table
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    document.querySelector(`tr[data-id="${id}"]`).remove();
    updateTotalsAfterRemoval(id);
    updatePieChart();
}

// Update Totals After Removal
function updateTotalsAfterRemoval(id) {
    const removedTransaction = transactions.find(transaction => transaction.id === id);
    if (removedTransaction) {
        if (removedTransaction.type === 'income') {
            totalIncome -= removedTransaction.amount;
        } else {
            totalExpenses -= removedTransaction.amount;
        }
    }
    const balance = totalIncome - totalExpenses;
    document.getElementById('income-total').textContent = `₹${totalIncome.toFixed(2)}`;
    document.getElementById('expenses-total').textContent = `₹${totalExpenses.toFixed(2)}`;
    document.getElementById('balance-total').textContent = `₹${balance.toFixed(2)}`;
}

// Add Entry Button
const addEntryButton = document.getElementById('add-entry');
addEntryButton.addEventListener('click', () => {
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (!category || isNaN(amount) || amount <= 0) {
        alert('Please enter valid details!');
        return;
    }

    const transaction = {
        id: Date.now(),
        type,
        category,
        amount
    };

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    addTransactionToTable(transaction);
    updateTotals(transaction);
    updatePieChart();
});

// Pie Chart
const showChartButton = document.getElementById('show-chart');
const chartSection = document.getElementById('chart-section');
const ctx = document.getElementById('expense-chart').getContext('2d');
let chart;

function updatePieChart() {
    const expenseCategories = transactions.filter(transaction => transaction.type === 'expense');
    const expenseData = expenseCategories.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {});

    const data = {
        labels: Object.keys(expenseData),
        datasets: [{
            data: Object.values(expenseData),
            backgroundColor: ['#ff6347', '#32cd32', '#1e90ff', '#ffcc00'],
        }]
    };

    if (expenseCategories.length > 0) {
        chartSection.style.display = 'block'; // Show the pie chart section
        if (chart) chart.destroy(); // Destroy the existing chart if it exists
        chart = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    } else {
        chartSection.style.display = 'none'; // Hide the chart if no expenses
    }
}

// Toggle the visibility of the pie chart
showChartButton.addEventListener('click', updatePieChart);
