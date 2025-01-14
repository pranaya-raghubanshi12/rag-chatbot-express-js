import express from 'express';
import AstraCollectionHelper from './helpers/AstraCollectionHelper.js'
import FileContentChunkingHelper from './helpers/FileContentChunkingHelper.js'
import ChatHelper from './helpers/ChatHelper.js'

const router = express.Router();

router.post("/upload", async function (req, res) {
    await AstraCollectionHelper.createCollection();
    const fileStoreInAstraResponse = await FileContentChunkingHelper.processAndStoreFile(req.file?.path);
    res.status(fileStoreInAstraResponse.status).json({ "message": fileStoreInAstraResponse.message })
});

router.post("/chat", async function (req, res) {
    if (!!!AstraCollectionHelper.dbExists()) {
        res.status(500).json({ "message": "Internal db server error" })
    }
    let { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid 'messages' format. Must be an array." });
    }

    const response = await ChatHelper.generateResponseStreamFromPrompt(messages);
    res.status(response.status).json({ "message": response.message })
});

export default router;