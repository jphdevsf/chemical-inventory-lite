import cors from "cors"
import express from "express"
import { deleteData } from "./routes/deleteData.js"
import { getData } from "./routes/getData.js"
import { postData } from "./routes/postData.js"
import { updateData } from "./routes/updateData.js"

const app = express()
const port = 3001

app.use(express.json())

app.use(cors())

app.get("/data", getData)
app.post("/data", postData)
app.put("/data", updateData)
app.delete("/data", deleteData)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
