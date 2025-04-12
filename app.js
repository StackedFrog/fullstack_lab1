import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv";

const app = express()

app.use(express.static("public"))

dotenv.config()

// connect db
await mongoose.connect(process.env.CONNECTION_URL)

// set up schema
const dishesSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    ingredients: [String],
    prepSteps: [String],
    prepTime: Number,  // additional
    cookingTime: Number,
    origin: String,
    difficulty: String, // additional
    spiceLevel: String // additional
})
// create db model
const dish = mongoose.model('Dishes', dishesSchema);

// start the server 
const server = app.listen(process.env.PORT, () => {
    console.log("running")
})
// allow json formt
app.use(express.json())

// api calls 
// return a json array of dishes
app.get("/api/dishes", async (req, res, next) => {
    dish.find()
    .then(dishes => {
        res.json(dishes)
    })
    .catch(error => {
        error = new Error("Not Found!")
        error.status = 404
        next(error)
    })
})

// return a dish by name (404 if doesnt exist)
app.get("/api/dishes/:name", async (req, res, next) =>{
    dish.find({name: req.params.name})
    .then(singleDish => {
        if (singleDish.length <= 0){
            
        }
        res.json(singleDish)
    })
    .catch(error => {
        error = new Error("Not Found!")
        error.status = 404
        next(error)
    })
})

// add a new dish, 201 if success, 409 if already exists!
app.post("/api/dishes", (req, res, next) => {
    const { name } = req?.body

    dish.findOne({ name })
    .then(existingDish => {
        if (existingDish) {
            return res.status(409).json({ error: "Dish already exists" })
        }

        const newDish = new dish(req?.body) // if there is a body, insert data
        return newDish.save()
    })
    .then(savedDish => {
        if (savedDish) {
            res.status(201).send()
        }
    })
    .catch(error => {
        error = new Error("Not Found!")
        error.status = 404
        next(error)
    })
})

// update existing dish, 404 if doesn't exist
app.put("/api/dishes/:id", async (req, res, next) => {
    dish.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
    )
    .then(updatedDish => {
        if (!updatedDish) {
            return res.status(404).json({ message: "Dish does not exist" })
        }
        res.status(200).json(updatedDish)
    })
    .catch(error => {
        error = new Error("Not Found!")
        error.status = 404
        next(error)
    })
})

// delete a dish, 404 if not real
app.delete("/api/dishes/:id", async (req, res, next) => {
    dish.findByIdAndDelete(req.params.id)
    .then(deletedDish => {
        if (!deletedDish) {
            return res.status(404).json({ message: "Dish not found" })
        }
        res.status(204).send() 
    })
    .catch(error => {
        error = new Error("Not Found!")
        error.status = 404
        next(error)
    })
})

// shuts down the server and closes the db connection 
async function shutdown(){
    server.close()
    await mongoose.disconnect()
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
