const path=require("path");
const ROOT=path.resolve(__dirname,"../..");
module.exports={ROOT,LOGS:path.join(ROOT,"logs"),PREVIEWS:path.join(ROOT,"server","previews")};