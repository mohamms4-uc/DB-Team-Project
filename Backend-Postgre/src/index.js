import express, { json } from "express";
const app = express();
import cors from "cors";


//middleware
app.use(cors());
app.use(json());

//ROUTES




app.listen(5000, () => {
    console.log("server has started on port 5000");
});
