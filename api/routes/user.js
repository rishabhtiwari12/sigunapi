const express=require('express');

const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken')
const Student=require('../model/user');
const User = require('../model/user');

const router=require('express').Router();



router.post('/signup',(req,res,next)=>{
    bcrypt.hash(req.body.password,10,(err,hash)=>{
        if(err)
        {
           return res.status(500).json({
               error: err
           })
        }
        else{
            const user=new User({
                _id: new mongoose.Types.ObjectId,
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                 password: hash
            })

            user.save()
            .then(result=>{
                console.log(result);
                res.status(200).json({
                  newUSer: result
                })
              })
              .catch(err=>{
                console.log(err);
                res.status(500).json({
                  error: err
                })
              })
        }
    })
})


router.post("/login",(req,res,next)=>{
    User.find({username: req.body.username})
    .exec()
    .then(user=>{
        if(user.length<1){
            return res.status(401).json({
                msg: 'user does not exist'
            })
        }

        bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
            if(!result){
                return res.status(401).json({
                    msg: "password not match"
                })
            }
            if(result){

                const token= jwt.sign({
                    username:user[0].username,
                    email:user[0].email,
                    phone: user[0].phone
                },
                'this is dummy text',
                {
                    expiresIn: "24h"
                });

                res.status(200).json({
                    username:user[0].username,
                    email:user[0].email,
                    phone: user[0].phone,
                    token:token
                })

            }
        })
    })
    .catch(err=>{
        res.status(500).json({
            error: err
        })
    })
})












module.exports= router;