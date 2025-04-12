import express from "express"
import mongoose from "mongoose"

const app = express()

// set up database here
mongoose.connect(process.env.CONNECTION_URL)

const dishesSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    ingredients: [String],
    prepSteps: [String],
    prepTime: Number,
    cookingTime: Number,
    origin: String,
    difficulty: String,
    spiceLevel: String
})

const server = app.listen(process.env.PORT, () => {
    console.log("running")
})
app.use(express.json())

// api calls 

// return a json array of dishes
app.get("/api/dishes", async (req, res, next) =>{
    
})

// return a dish by name (404 if doesnt exist)
app.get("/api/dishes/:name", async (req, res, next) =>{
    
})

// add a new dish, 201 if success, 409 if already exists!
app.post("/api/dishes", async (req, res, next) =>{
    
})

// update existing dish, 404 if doesn't exist
app.put("/api/dishes/:id", async (req, res, next) =>{
    
})

// delete a dish, 404 if not real
app.delete("/api/dishes/:id", async (req, res, next) =>{
    
})


async function shutdown(){
    server.close()
    // await close db connection
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
