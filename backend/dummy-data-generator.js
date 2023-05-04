const faker = require('faker');
const mysql = require('mysql2/promise');

const cabNames = ['Uber', 'Bolt', 'FreeNow'];
const numRecords = 1000;
const numDuplicates = 10;

const main = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'upZAiK3hjRdpbA7j2dcB',
      database: 'cab_prices',
    });

    for (let i = 0; i < numRecords; i++) {
      const cabName = faker.random.arrayElement(cabNames);
      const pickupLocation = faker.address.streetAddress();
      const dropoffLocation = faker.address.streetAddress();
      const distance = faker.random.number({ min: 1, max: 20 });
      const price = faker.random.number({ min: 5, max: 50 });

      const [result] = await connection.execute(
        `
        INSERT INTO prices (cab_name, pickup_location, dropoff_location, distance, price)
        VALUES (?, ?, ?, ?, ?);
      `,
        [cabName, pickupLocation, dropoffLocation, distance, price]
      );

      console.log(`Inserted record ${i + 1}: ${cabName} - ${price}`);
    }

    for (let i = 0; i < numDuplicates; i++) {
      const cabName = faker.random.arrayElement(cabNames);
      const pickupLocation = "Location A2";
      const dropoffLocation = "Location B2";
      const distance = faker.random.number({ min: 1, max: 20 });
      const price = faker.random.number({ min: 5, max: 50 });

      const [result] = await connection.execute(
        `
        INSERT INTO prices (cab_name, pickup_location, dropoff_location, distance, price)
        VALUES (?, ?, ?, ?, ?);
      `,
        [cabName, pickupLocation, dropoffLocation, distance, price]
      );

      console.log(`Inserted duplicate record ${i + 1}: ${cabName} - ${price}`);
    }

    connection.end();
  } catch (error) {
    console.error('Error generating dummy data:', error);
  }
};

main();
