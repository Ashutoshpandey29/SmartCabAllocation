import connection from "../config/db.js"; // Import the database connection

// Function to create the cabs table
const tables = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS cabs (
            cabId INT AUTO_INCREMENT PRIMARY KEY, -- Use SERIAL for PostgreSQL
            driver_name VARCHAR(100) NOT NULL,
            car_type VARCHAR(50),
            rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
            latitude DECIMAL(9, 6) NOT NULL,
            longitude DECIMAL(9, 6) NOT NULL
        );
    `;

    try {
        await connection.query(createTableQuery);
        console.log("Cabs table created successfully!");
    } catch (error) {
        console.error("Error creating cabs table:", error);
    }
};

export default tables;
