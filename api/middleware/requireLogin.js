const mongoose=require("mongoose");
const User = require("../model/user");
const jwt=require("jsonwebtoken");


module.exports=(req,res,next)=>{
    const authorization= req.headers.authorization;
    if(!authorization){
        
        res.status(401).json({error: "you must be logged in" })
    }
    
    const token=authorization.replace("Bearer ","")
    
    
    jwt.verify(token,'this is dummy text',(err,payload)=>{
        
        if(err){
            return res.status(401).json({error: "you must be logged in"})
        }
        const _id=payload._id;
        User.findById(_id).then(userdata=>{
            req.user=userdata;
            next(); 
        })
        
    })

}