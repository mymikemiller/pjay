var aggregator = require("./aggregator")

// TODO: Get this from an image in the firebase database for this feed
var titleImage = "https://reallifeglobal.com/wp-content/uploads/2016/04/podcast-300x300.png"

module.exports = {
    generate: function(podcastDatas) {
        var funnel = [ { rss: [ { _attr: { version: '2.0', "xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd", 
        "xmlns:media": "http://search.yahoo.com/mrss/"} }, 
            generateChannelObj(podcastDatas)
        ] } ];
    
        return funnel
    },
    hi: "hello"
};

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