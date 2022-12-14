let mongoose = require("mongoose");

let makeupSchema = mongoose.Schema({
    prodName: {
        type: String,
        required: false
    },
    review: {
        type: String,
        required: false
    },
    type: {
        type: String,
        required: false
    },
    rating: {
        type: Number,
        required: false
    },
    posted_by: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model("Makeup", makeupSchema)