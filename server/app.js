// Curate shared podcast feeds
// 
// Run the following in separate terminals to start the server, accessible over the internet
// npm start
// lt --port 7000 --subdomain pjay
//
// xml feed can now be accessed at https://pjay.localtunnel.me
//
'use strict';
var argv = require('minimist')(process.argv.slice(2));

const SERVICE_ACCOUNT_FILE_PATH = argv["firebase-adminsdk-path"] || "";

var express = require("express");
var bodyParser = require("body-parser");
var path = require("path")
var xml = require("xml")
var request = require("request");
var parsePodcast = require("node-podcast-parser");
var funnel = require("./support/funnel");
var firebase = require("./support/firebase")(SERVICE_ACCOUNT_FILE_PATH)

var app = express()
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, "public")));

var port = process.env.port || 7000

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


function requestPodcastDatas(feedURLs) {
    console.log("requesting feeds for urls ", feedURLs)
    var getAllPodcastDataPromises = []
    feedURLs.forEach(url => {
        getAllPodcastDataPromises.push(getPodcastData(url));
    })
    return Promise.all(getAllPodcastDataPromises);
    
    // return new Promise((resolve, reject) => {
    //     Promise.all(
    //         getAllPodcastDataPromises
    //         ).then(podcastDatas => {

    //         console.log("got podcastData");
    //         var feed = generateFunnel(podcastDatas)
    //         resolve(feed)
    //     });
    // })
}

app.listen(port, function() {
    console.log("Server is running on port " + port);
})

// app.get("/", function(req, res) {
//     console.log("at get('/')");

//     requestPodcastDatas(gameGrumpsFeed).then(podcastDatas => {
//         console.log("got", podcastDatas.length, "podcastDatas")
//         var myFunnel = funnel.generate(podcastDatas)

//         res.set('Content-Type', 'text/xml');
//         res.send(xml(myFunnel, { declaration: true }));
//     });
// })

app.get("/funnels/:name", function(req, res) {
    var name = req.params.name
    console.log("at get('/funnels') for funnel named", name);

    firebase.getFeedURLs(name).then(feedURLs => {
        return requestPodcastDatas(gameGrumpsFeed)
    }).then(podcastDatas => {
        console.log("got", podcastDatas.length, "podcastDatas")
        var myFunnel = funnel.generate(podcastDatas)

        res.set('Content-Type', 'text/xml');
        res.send(xml(myFunnel, { declaration: true }));
    }).catch(err => {
        console.error(err)
        res.status(500).send(err)
    });
})