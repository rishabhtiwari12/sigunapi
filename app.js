const express=require("express");
const bodyParser=require('body-parser');


const app=express();
const port=process.env.PORT||3000;
app.listen(port,(req,res)=>{
    console.log("server started on port 3000");
})
app.use(bodyParser.urlencoded({extended: true}));
 app.use(bodyParser.json());


const studentRoute=require('./api/routes/student');
const userRoute=require('./api/routes/user');


app.use('/student',studentRoute);
app.use('/user',userRoute);


const mongoose=require('mongoose');

mongoose.connect('mongodb+srv://admin-rishabh:1234@cluster0.jzrhe.mongodb.net/apidatabase?retryWrites=true&w=majority')

mongoose.connection.on('error',err=>{
    console.log("failed to connect");
});

mongoose.connection.on('connected',connected=>{
    console.log("connect succesfull");
});
 
app.use((req,res,next)=>{
    res.status(404).json({
        message: 'bad request'
    });
});

