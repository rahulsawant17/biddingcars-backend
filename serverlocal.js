const app = require('./express/server');
require('dotenv').config();
const carsRouter = require('./routes/cars');
const usersRouter = require('./routes/users');
const port = process.env.PORT || 5000;
app.use('/cars', carsRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
