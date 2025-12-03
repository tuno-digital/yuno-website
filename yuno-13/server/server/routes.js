module.exports=(app)=>{
 app.use("/api/ia",require("./routers/ia"));
 app.get("/",(req,res)=>res.json({ok:true,msg:"YUNO API root"}));
 app.use((req,res)=>res.status(404).json({ok:false,error:"Endpoint não encontrado."}));
};