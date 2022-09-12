const express = require("express");
const asyncify = require("express-asyncify");
const router = asyncify(express.Router());

/**
 * Digital Connector 서버가 실행될 때 Flink에 연결하여 받은 session을
 * 이 서버(Digital Brain)로 sessionId를 공유해줌
 */
router.post("/flink/:sessionId", (req, res) => {
	global.SESSION_ID = req.params.sessionId;
	console.log("sessionID: ", global.SESSION_ID);

	res.success();
});

module.exports = router;
