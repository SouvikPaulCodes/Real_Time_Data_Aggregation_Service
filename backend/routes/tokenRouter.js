const {Router} = require("express")
const {baseControl, addressControl} = require("../controllers/tokenControl")

const tokenRouter = Router({mergeParams: true});

tokenRouter.get("/", baseControl);
tokenRouter.get("/:address", addressControl);

module.exports = tokenRouter;