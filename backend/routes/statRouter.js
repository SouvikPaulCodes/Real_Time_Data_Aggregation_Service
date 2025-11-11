const {Router} = require("express")
const statControl = require("../controllers/statControl")

const statRouter = Router({mergeParams: true});

statRouter.get("/", statControl);

module.exports = statRouter