import cors from "cors"
import express from "express"
import serverless from "serverless-http"
import { deleteData } from "../../server/routes/deleteData.js"
import { getData } from "../../server/routes/getData.js"
import { postData } from "../../server/routes/postData.js"
import { updateData } from "../../server/routes/updateData.js"

const api = express()

api.use(express.json())
api.use(cors())
api.get("/data", getData)
api.post("/data", postData)
api.put("/data", updateData)
api.delete("/data", deleteData)

export const handler = serverless(api)
