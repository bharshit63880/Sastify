const express = require("express");
const bannerController = require("../controllers/Banner");
const { requireAdmin, verifyToken } = require("../middleware/VerifyToken");

const router = express.Router();

router.post("/", verifyToken, requireAdmin, bannerController.create);
router.get("/", bannerController.getAll);
router.get("/:id", bannerController.getById);
router.patch("/:id", verifyToken, requireAdmin, bannerController.updateById);
router.delete("/:id", verifyToken, requireAdmin, bannerController.deleteById);

module.exports = router;
