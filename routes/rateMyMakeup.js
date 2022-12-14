var express = require('express');
var router = express.Router();

var { check, validationResult } = require("express-validator");
const { render } = require('../app');
var makeup = require("../schemas/makeup")

var Makeup = require("../schemas/makeup");
var User = require("../schemas/user");


router.get('/add', ensureAuthenticated, function (req, res) {
    res.render("add")
})
//Book Add
router.route("/add")
    .get(ensureAuthenticated, (req, res) => {
        res.render('Add', { title: 'Add a Review'});
    })
    .post(ensureAuthenticated, async (req, res) => {
        var makeup = new Makeup();
        await check("prodName", "**Name Required").notEmpty().run(req);
        await check("review", "**Review Required").notEmpty().run(req);
        await check("type", "**Product Type Required").notEmpty().run(req);
        await check("rating", "**Rating Required").notEmpty().run(req);
        const errors = validationResult(req);
        makeup.prodName = req.body.prodName;
        makeup.review = req.body.review;
        makeup.type = req.body.type;
        makeup.rating = req.body.rating;
        makeup.posted_by = req.user.id;
        makeup.save();

        if (errors.isEmpty()) {
            makeup.save((err) => {
                if (err) {
                    console.log(err);
                    res.send("Error Happened!");
                } else {
                    res.redirect("/");
                }
            });
        } else {
            res.render("add", {
                errors: errors.array()
            })
        }
    })

router.get("/:id", function (req, res) {
    Makeup.findById(req.params.id, function (err, makeup) {
        User.findById(makeup.posted_by, function (err, user) {
            if (err) {
                console.log(err);
            }
            res.render("makeup", {
                'makeup': makeup,
                'user': user
            })
        })
    })
})


router.get("/delete/:id", ensureAuthenticated, function (req, res) {
    Makeup.findById(req.params.id, function (err, makeup) {
        if (err) {
            console.log(err)
        } else if (req.user._id == makeup.posted_by) {
            console.log("req " + req.user._id + "\n rest " + makeup.posted_by)
            res.render("delete", {
                'makeup': makeup
            })
        } else {
            res.redirect("/user/deny")
        }
    })
})

router.post("/delete/:id", ensureAuthenticated, function (req, res) {
    if (!req.user._id) {
        res.status(500).send();
    }

    let query = { _id: req.params.id };

    Makeup.findById(req.params.id, function (err, makeup) {
        if (makeup.posted_by != req.user._id) {
            res.status(500).send();
        } else {

            Makeup.deleteOne(query, function (err) {
                if (err) {
                    console.log(err);
                }
                res.redirect("/");
            });
        }
    });
});


router.get("/edit/:id", ensureAuthenticated, function (req, res) {
    Makeup.findById(req.params.id, function (err, makeup) {
        if (makeup.posted_by != req.user._id) {
            res.redirect("/");
        }
        res.render("edit", {
            "makeup": makeup
        })
    })
})

router.post("/edit/:id", ensureAuthenticated, function (req, res) {
    let makeup = {};

    makeup.prodName = req.body.prodName;
    makeup.review = req.body.review;
    makeup.type = req.body.type;
    makeup.rating = req.body.rating;

    let query = { _id: req.params.id }

    Makeup.findById(req.params.id, function (err, database) {
        if (database.posted_by != req.user._id) {
            res.redirect("/")
        } else {
            Makeup.updateOne(query, makeup, function (err) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    res.redirect("/");
                }
            })
        }
    })
})

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/users/deny");
    }
}

module.exports = router;