var mongoose = require("mongoose");

var podcastSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    ownerName: String,
    ownerEmail: String,
    feedUrl: String
});

module.exports = mongoose.model("Podcast", podcastSchema);
