const request = require('request');
const parsePodcast = require('node-podcast-parser');
const mongoose = require("mongoose")

const Podcast = require("./models/podcast.js")
const Episode = require("./models/episode.js")
 
mongoose.connect("mongodb://test:testtest@ds263988.mlab.com:63988/tribute");

let feedUrl = 'http://feeds.feedburner.com/DailyTechHeadlines'

request(feedUrl, (err, res, dataString) => {
    if (err) {
        console.error('Network error', err);
        return;
    }
  
    parsePodcast(dataString, (err, data) => {
        if (err) {
            console.error('Parsing error', err);
            return;
        }

        var podcast = new Podcast({
            title: data.title,
            ownerName: data.owner.name,
            ownerEmail: data.owner.email,
            feedUrl: feedUrl
        })
        
        podcast.save(function (err) {
            console.log(err)
            console.log("saved")
            Podcast.find(function (err2, podcasts) {
                console.log(podcasts);
            });
        });

        data.episodes.forEach(function(element) {
            addEpisode(element, podcast);
        });

        // for (var episode in data.episodes) {
        //     console.log(episode)
        // }
  
    });

    // Quit the program
    process.exit()
});

function addEpisode(data, podcast) {

    console.log(data.title)
    console.log(podcast._id)
    console.log(data.enclosure.url)

    // var episode = new Episode({
    //   title: data.title,
    //   podcastId: podcast._id,
    //   seconds: seconds
    // })

    // episode.save(function (err) {
    //   Episode.find(function (err2, episodes) {
    //       console.log(episodes);
    //   });
    // });


}