// Curate shared podcast feeds
// 
// Run the following in separate terminals to start the server, accessible over the internet
// npm start
// lt --port 7000 --subdomain pjay
//
// xml feed can now be accessed at https://pjay.localtunnel.me
//
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path")
var xml = require("xml")
var request = require("request");
var parsePodcast = require("node-podcast-parser");
var aggregator = require("./support/aggregator")

var app = express()
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, "public")));

var port = process.env.port || 7000

var titleImage = "https://reallifeglobal.com/wp-content/uploads/2016/04/podcast-300x300.png"

// Just Game Grumps audio
var gameGrumpsFeed = [
    "https://podsync.net/qyJ88uh3h" // Game Grumps
];


// Parses the given feed and sends to the callback the array of node-podcast-parser's data
// Access the episodes via data.episodes for the returned data
function getPodcastData(feedURL) {
    return new Promise((resolve, reject) => {
        request(feedURL, (err, res, data) => {
            if (err) {
              console.error('Network error', err);
              reject(err)
              return;
            }
           
            parsePodcast(data, (err, podcastData) => {
                if (err) {
                    console.error('Parsing error', err);
                    reject(err)
                    return;
                }
            
                resolve(podcastData)
            });
        });
    })
}

function generateChannelObj(podcastDatas) {

    var channelObj = { channel: [
        {"media:thumbnail": { _attr: { "url": titleImage } } },
        {"itunes:image": { _attr: { "href": titleImage } } },
        {"title": "PJAY"},
        {"description": "Some awesome podcasts!"},
        {"generator": "PJAY"}
    ] }

    var items = aggregator.aggregateItems(podcastDatas)

    // Add the items to the channel object
    Array.prototype.push.apply(channelObj.channel, items)

    return channelObj
}

function generateFunnel(podcastDatas) {
    var feed = [ { rss: [ { _attr: { version: '2.0', "xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd", 
    "xmlns:media": "http://search.yahoo.com/mrss/"} }, 
        generateChannelObj(podcastDatas)
    ] } ];
    
    return feed
}

function requestFeed(feedURLs) {
    console.log("requesting feeds for urls ", feedURLs)
    var getAllPodcastDataPromises = []
    feedURLs.forEach(url => {
        getAllPodcastDataPromises.push(getPodcastData(url));
    })
    return new Promise((resolve, reject) => {
        Promise.all(
            getAllPodcastDataPromises
            ).then(podcastDatas => {

            console.log("got podcastData");
            var feed = generateFunnel(podcastDatas)
            resolve(feed)
        });
    })
}

app.listen(port, function() {
    console.log("Server is running on port " + port);
})

app.get("/", function(req, res) {
    console.log("at get('/')");

    requestFeed(gameGrumpsFeed).then(feed => {
        console.log("got feed")
        res.set('Content-Type', 'text/xml');
        res.send(xml(feed, { declaration: true }));
    });
})