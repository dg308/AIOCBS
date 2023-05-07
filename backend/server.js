const database = require('./database');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal server error');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



app.get('/prices', async (req, res) => {
  try {
    console.log('Handling /prices request...');
    let pickupLocation = req.query.pickup.split(',')[0].trim();
    let dropoffLocation = req.query.dropoff.split(',')[0].trim();
    console.log('Pickup location:', pickupLocation);
    console.log('Dropoff location:', dropoffLocation);
    const query = 'SELECT cab_name, AVG(price) as average_price FROM prices WHERE LOWER(pickup_location) = LOWER(?) AND LOWER(dropoff_location) = LOWER(?) GROUP BY cab_name';
    console.log('Executing query:', query);
    const [rows] = await database.query(query, [pickupLocation, dropoffLocation]);
    console.log('Fetched rows from database:', rows);
    if (!rows || rows.length === 0) {
      console.error('No rows found in the database for the given locations');
      return res.status(404).send('No data found for the given locations');
    }
    console.log('Sending response:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error handling /prices request:', error);
    res.status(500).send('Internal server error');
  }
});





