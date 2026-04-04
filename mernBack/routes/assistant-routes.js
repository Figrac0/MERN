const express = require("express");

const assistantControllers = require("../controllers/assistant-controller");

const router = express.Router();

router.get("/status", assistantControllers.getAssistantStatus);
router.post("/chat", assistantControllers.chatWithAssistant);

module.exports = router;
