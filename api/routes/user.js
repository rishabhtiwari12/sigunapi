const express = require("express");

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Student = require("../model/user");
const User = require("../model/user");
const Post = require("../model/post");
const requireLogin = require("../middleware/requireLogin");

const router = require("express").Router();
router.post("/createPost", requireLogin, (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(422).json({ error: "please add all fields" });
  }
  req.user.password = undefined;
  const post = new Post({
    title,
    body,
    postedBy: req.user,
  });
  post.save()
    .then((result) => {
      res.json({ post: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/allpost", (req, res) => {
  Post.find()
    .populate("postedBy", "username _id")
    .then((posts) => {
      res.json({ posts: posts });
    })
    .catch((err) => {
      res.json({ error: err });
    });
});

router.get("/protected", requireLogin, (req, res) => {
  res.send("hello user");
});

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    } else {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        password: hash,
      });

      user
        .save()
        .then((result) => {
          console.log(result);
          res.status(200).json({
            newUSer: result,
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            error: err,
          });
        });
    }
  });
});

router.post("/login", (req, res, next) => {
  User.find({ username: req.body.username })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          msg: "user does not exist",
        });
      }

      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (!result) {
          return res.status(401).json({
            msg: "password not match",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              _id: user[0]._id,
            },
            "this is dummy text",
            {
              expiresIn: "24h",
            }
          );

          res.status(200).json({
            token: token,
          });
        }
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/mypost", requireLogin, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate("postedBy", "_id username")
    .then((mypost) => {
      res.json({ mypost });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put("/like", requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body._id,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
});
router.delete("/deletepost",requireLogin,(req,res)=>{
    Post.findOne({_id: req.body._id})
    .populate("postedBy","_id")
    .exec((err,post)=>{
        if(err||!post){
            console.log(err);
            return res.status(402).json({error:err});
        }
        if(post.postedBy._id.toString()===req.user._id.toString()){
            console.log(post)
            post.remove()
             .then(result=>{
                    res.json({leftpost: result});
             })
             .catch(err=>{
                 console.log(err);
             })

        }
    })
})


module.exports = router;
