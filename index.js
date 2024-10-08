const connectMongo= require("./db");
const express = require('express')
var cors = require('cors')
connectMongo();
const app = express()
const port = process.env.PORT || 4000
app.use(cors());

 
app.use(express.json())
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port,() => {
  console.log(`Example app listening on port ${port}`)
});
