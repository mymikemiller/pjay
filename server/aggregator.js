module.exports = {
    // Return a single channel object with all the episodes from the specified podcastDatas
    aggregateItems: function(podcastDatas) {

        var items = []

        for (var i=0; i<podcastDatas.length; i++) {
            // podcastData has all the information for one of the podcasts we were sent in. Get all the episodes from it by iterating its episodes object.
            let podcastData = podcastDatas[i];
            for(var j = 0; j < podcastData.episodes.length; j++) {
                var episode = podcastData.episodes[j];
                
                var item = 
                    { item: [
                        { guid: episode.guid },
                        { title: episode.title },
                        { link: episode.link },
                        { description: episode.description},
                        { pubDate: episode.published.toString() },
                        { enclosure: [
                            { _attr: { url: episode.enclosure.url } },
                            { _attr: { length: episode.enclosure.length } },
                            { _attr: { type: episode.enclosure.type } } 
                        ] },
                        { "itunes:subtitle": episode["itunes:subtitle"] },
                        { "itunes:image": [
                            { _attr: { href: episode["itunes:image"] } }
                        ]},
                        { "itunes:duration": episode.duration },
                        { "itunes:order": 0}
                    ]}

                items.push(item)
            }
        }

        // Sort by pubDate
        items = items.sort((a, b) => {
            let dateA = new Date(a.item.find(itemData => itemData.hasOwnProperty("pubDate")).pubDate)
            let dateB = new Date(b.item.find(itemData => itemData.hasOwnProperty("pubDate")).pubDate)

            return dateB - dateA;
        })

        return items;
    }
}