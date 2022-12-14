const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport")

const { check, validationResult } = require("express-validator");


let User = require("../schemas/user");

router
  .route("/register")

  .get((req, res) => {

    res.render("registration");
  })
  .post(async (req, res) => {
    await check("username", "**Name Required").notEmpty().run(req);
    await check("email", "**Email Required").notEmpty().run(req);
    await check("password", "**Password Required").notEmpty().run(req);
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      let newUser = new User();

      newUser.username = req.body.username;
      newUser.email = req.body.email;

      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hashed_password) {
          if (err) {
            console.log(err);
          } else {
            newUser.password = hashed_password;
            newUser.save(function (err) {
              if (err) {
                console.log(err);
                return;
              } else {
                res.redirect("/users/login");
              }
            });
          }
        });
      });
    } else {
      res.render("registration", {
        errors: errors.array(),
      });
    }
  });

router
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(async (req, res, next) => {
    await check("email", "**Email Required").notEmpty().run(req);
    await check("password", "**Password Required").notEmpty().run(req);
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/users/login",
        failureMessage: true,
      })(req, res, next);
    } else {
      res.render("login", {
        errors: errors.array(),
      });
    }
  });

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/users/login");
  });
});

router.get("/invalid", function(req,res){
  res.render("invaliduser")
})

module.exports = router;