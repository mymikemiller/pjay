var mongoose = require("mongoose");

var episodeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    podcastId: String,
    seconds: Number,
    mediaUrl: String
});

module.exports = mongoose.model("Episode", episodeSchema);
