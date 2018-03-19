// A podcast feed that uses the data from the tribute database on mLab: https://mlab.com/databases/tribute
// Run the following in separate terminals to start the server, accessible over the internet
// npm start
// lt --port 7000 --subdomain tribute
//
// xml feed can now be accessed at https://tribute.localtunnel.me
//
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path")
var xml = require("xml")
var request = require("request");
var parsePodcast = require("node-podcast-parser");

var app = express()
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, "public")));

var port = process.env.port || 7000

var gameGrumpsFeed = [
    "https://podsync.net/9jo89Nu3f", // Game Grumps
    "https://podsync.net/0SFebNu3h", // Carlsagan42
    "https://podsync.net/ioVZ9Nudf" // Game Theory
];
var scienceFeed = [
    "https://podsync.net/dKTg_2g3f", // asapSCIENCE
    "https://podsync.net/02xdm2u3f", // Veritasium
    "https://podsync.net/F9QsmNgdf", // Minutephysics
    "https://podsync.net/MOtV_2gdh", // Vihart
    "https://podsync.net/76SpmNg3f" // CGP Gray
];

var audioFeed = [
    "http://atp.fm/episodes?format=rss", // ATP
    "https://www.npr.org/rss/podcast.php?id=510299", // Ask me another
    "", //
    "", //
    "", //
    "", //
]

var techFeed =[
    "http://feeds.feedburner.com/DailyTechHeadlines"
]

// Return a single channel object with all the episodes from the specified podcastDatas
function aggregateChannels(podcastDatas) {

    var channelObj = { channel: [] }

    for (var i=0; i<podcastDatas.length; i++) {
        // podcastData has all the information for one of the podcasts we were sent in. Get all the episodes from it by iterating its episodes object.
        let podcastData = podcastDatas[i];
        for(var j = 0; j < podcastData.episodes.length; j++) {
            var episode = podcastData.episodes[j];
            
            var item = 
                { item: [
                    { guid: episode.guid },
                    { title: episode.title },
                    { link: "www.cheese.com" },
                    { description: "test" },
                    { pubDate: episode.published.toString() },
                    { enclosure: [
                        { _attr: { url: episode.enclosure.url } },
                        { _attr: { length: "255850000" } },
                        { _attr: { type: "video/mp4" } } 
                    ] },
                    { "itunes:subtitle": episode.title },
                    { "itunes:image": [
                        { _attr: { href: "https://i0.wp.com/www.onegreenplanet.org/wp-content/uploads/2015/08/cheese.jpg" } }
                    ]},
                    { "itunes:duration": "1:45" },
                    { "itunes:order": 1}
                ]}

            channelObj.channel.push(item)
        }
    }

    // Sort the items in channelObj.channel (the episodes) 

    // Sort by pubDate
    channelObj.channel = channelObj.channel.sort((a, b) => {
        let dateA = new Date(a.item.find(itemData => itemData.hasOwnProperty("pubDate")).pubDate)
        let dateB = new Date(b.item.find(itemData => itemData.hasOwnProperty("pubDate")).pubDate)

        return dateB - dateA;
    })

    return channelObj
}

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

function generateFeed(podcastDatas) {
    var feed = [ { rss: [ { _attr: { version: '2.0', "xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd", 
    "xmlns:media": "http://search.yahoo.com/mrss/"} }, 
        aggregateChannels(podcastDatas)
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
            var feed = generateFeed(podcastDatas)
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

app.get("/gamegrumps", function(req, res){
    console.log("at get gamegrumps")
    requestFeed(gameGrumpsFeed).then(feed => {
        console.log("got feed")
        res.set('Content-Type', 'text/xml');
        res.send(xml(feed, { declaration: true }));
    });
}) 
app.get("/science", function(req, res){
    console.log("at get science")
    requestFeed(scienceFeed).then(feed => {
        console.log("got feed")
        res.set('Content-Type', 'text/xml');
        res.send(xml(feed, { declaration: true }));
    });
}) 

app.get("/tech", function(req, res){
    console.log("at get tech")
    requestFeed(techFeed).then(feed => {
        console.log("got feed")
        res.set('Content-Type', 'text/xml');
        //res.redirect("http://feeds.feedburner.com/DailyTechHeadlines")
        res.send(xml(feed, { declaration: true }));
    });
}) 


// Intercept calls like localhost:7000/media/url="blah.mp3"
// Return the media at the specified url after incrementing the download counter in our database
app.get("/media", function(req, res) {
    console.log("at get('/media')");
    console.log("url:", req.query.url)

    res.redirect(req.query.url)
})