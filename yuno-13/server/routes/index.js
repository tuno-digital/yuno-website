
const express = require("express");
const app = express();
app.use(express.json());
require("./routes")(app);
const PORT=4455;
app.listen(PORT, ()=> console.log("YUNO FIXED running",PORT));
