import cors from "cors"
import express from "express"
import serverless from "serverless-http"
import { deleteData } from "../../server/routes/deleteData.js"
import { getData } from "../../server/routes/getData.js"
import { postData } from "../../server/routes/postData.js"
import { updateData } from "../../server/routes/updateData.js"

const app = express()

app.use(express.json())
app.use(cors())

app.get("/data", getData)
app.post("/data", postData)
app.put("/data", updateData)
app.delete("/data", deleteData)

export const handler = serverless(app)
