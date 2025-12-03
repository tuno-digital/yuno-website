const express=require("express");
const router=express.Router();
const API_KEY=process.env.API_KEY||process.env.YUNO_API_KEY||"";
function requireApiKey(req,res,next){
 const key=req.headers["x-api-key"]||req.query["api_key"]||"";
 if(!API_KEY) return res.status(500).json({ok:false,error:"Server misconfigured: API_KEY missing"});
 if(!key||String(key).trim()!==String(API_KEY).trim()) return res.status(401).json({ok:false,error:"API key inválida"});
 next();
}
router.get("/ping",(req,res)=>res.json({ok:true,status:"YUNO 13.0 (fixed) operational",timestamp:Date.now()}));
router.post("/process",requireApiKey,(req,res)=>{
 const b=req.body||{};
 const prompt=b.prompt||b.comando||b.message||"";
 if(!prompt.trim()) return res.status(400).json({ok:false,error:"empty prompt"});
 res.json({ok:true,message:"Comando recebido",prompt:prompt.trim(),reply:prompt.trim().toLowerCase()==="ping"?"pong":"ack",timestamp:Date.now()});
});
router.get("/preview-frame",(req,res)=>{
 const id=req.query.id;
 if(!id) return res.status(400).send("missing id");
 return res.redirect(`/previews/${encodeURIComponent(id)}.html`);
});
module.exports=router;