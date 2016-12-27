let FeedParser = require('feedparser'),
  request = require('request'),
  moment = require('moment'),
  express = require('express')

let config = {
  port: 8081
}
let fluxs = [
  {
    url: 'https://www.smashingmagazine.com/feed/',
    name: 'Smashing Magazine',
    logo: 'https://pbs.twimg.com/profile_images/477218012194304000/ytI5hY2H.png'
  },
  {
    url: 'http://korben.info/feed',
    name: 'Korben',
    logo: 'https://pbs.twimg.com/profile_images/797057160366657536/vmmIoiAy.jpg'
  },
  {
    url: 'http://alistapart.com/main/feed',
    name: 'A list apart',
    logo: 'https://pbs.twimg.com/profile_images/478913945475235840/Jv1mMBOA.jpeg'
  },
  {
    url: 'http://hackingui.com/feed/',
    name: 'Hacking UI',
    logo: 'https://pbs.twimg.com/profile_images/752772580134838273/OUQd_roH.jpg'
  },
  {
    url: 'http://www.alsacreations.com/rss/actualites.xml',
    name: 'Alsacreations',
    logo: 'https://pbs.twimg.com/profile_images/507471438584885248/OK8krv99_400x400.png'
  },
  {
    url: 'http://www.developpez.com/index/rss',
    name: 'Developpez.com',
    logo: 'https://pbs.twimg.com/profile_images/482433295758553088/av4cIucb_400x400.jpeg'
  },
  {
    url: 'https://fredcavazza.net/feed/',
    name: 'Fred Cavazza',
    logo: 'https://pbs.twimg.com/profile_images/672791255265488896/9PVyUomO.jpg'
  },
  {
    url: 'https://developers.google.com/web/updates/rss.xml',
    name: 'Google dev',
    logo: 'https://pbs.twimg.com/profile_images/1320180647/chromiumchrome_400x400.png'
  }
]

let yesterday = moment().add(-1, 'days').format('DD/MM/YYYY')
let today = moment().format('DD/MM/YYYY')
let limit = moment().add(-15, 'days')

let news = []

let app = express()
app.use(express.static(__dirname + '/public'))

let server = app.listen(config.port, function() {
  let host = server.address().address
  let port = server.address().port
  console.log('Ouvrir votre navigateur sur http://localhost:%s', config.port)
})

app.get('/news', (req, res) => {
  news.sort((a, b) => ((a.timestamp > b.timestamp) ? -1 : 1))
  res.send(news)
})

fluxs.forEach(flux => {
  let stream = new FeedParser()
  let req = request(flux.url)

  req.on('error', error => {
    console.log('Flux ' + flux.name + ' failed to request')
  })
  req.on('response', function(res) {
    if (res.statusCode != 200) return req.emit('error', new Error('Bad status code'))
    req.pipe(stream)
  })

  stream.on('error', error => {
    console.log('Flux ' + flux.name + ' failed to parse')
  })
  stream.on('readable', function() {
    let meta = stream.meta,
      item

    while (item = stream.read()) {
      if (!item.date)
        item.date = item.meta.date
      if (!item.date)
        item.date = item.pubDate
      if (!item.categories)
        item.categories = item.category || []
     
      if (limit.utc() < moment(item.date).utc() && !item.categories.some(cat => cat === 'Editos')) {
        let n = {
          flux: flux,
          link: item.link,
          timestamp: moment(item.date),
          date: moment(item.date).format('DD/MM/YYYY HH:mm'),
          title: item.title,
          categories: item.categories,
          description: item.description || item['rss:description']
        }
        news.push(n)
        console.log(n.date + ' - ' + n.title + ' (' + n.flux.name + ') ['+n.categories.join(', ')+']')
      }
    }
  })
})
