const { Router } = require("express");
const homeControllers = require("../controllers/homeControllers");

const router = Router();

router.get("/", homeControllers.home_get);
router.post("/device", homeControllers.home_post);
router.post("/status", homeControllers.status_post);

module.exports = router;
