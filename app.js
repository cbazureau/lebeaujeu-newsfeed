let FeedParser = require('feedparser'),
  request = require('request'),
  moment = require('moment'),
  express = require('express')

let config = {port: 8081}
let fluxs = [
  {url: 'https://www.smashingmagazine.com/feed/', name: 'Smashing Magazine' },
  {url: 'http://korben.info/feed', name: 'Korben' },
  {url: 'http://alistapart.com/main/feed', name: 'A list apart' },
  {url: 'http://hackingui.com/feed/', name: 'Hacking UI' }
  
]

let yesterday = moment().add(-1, 'days').format('DD/MM/YYYY')
let today = moment().format('DD/MM/YYYY')
let limit = moment().add(-5, 'days')

let news = []

let app = express()
app.use(express.static(__dirname + '/public'))

let server = app.listen(config.port, function () {
  let host = server.address().address
  let port = server.address().port
  console.log('Ouvrir votre navigateur sur http://localhost:%s', config.port)
})

app.get('/news', (req, res) => {
    news.sort((a,b) => ((a.timestamp > b.timestamp) ? -1 : 1) )
  res.send(news)
})

fluxs.forEach(flux => {
  let req = request(flux.url)

  req.on('error', function (error) {
    // handle any request errors
  })
  req.on('response', function (res) {
    let stream = this

    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'))

    stream.pipe(feedparser)
  })

  let feedparser = new FeedParser()
  feedparser.on('error', function (error) {
    // always handle errors
  })
  feedparser.on('readable', function () {
    // This is where the action is!
    let stream = this,
      meta = this.meta, // **NOTE** the "meta" is always available in the context of the feedparser instance
      item

    while (item = stream.read()) {
      if (!item.date) item.date = item.meta.date
      if (limit.utc() < moment(item.date).utc() && !item.categories.some(cat => cat === 'Editos')) {
        news.push({
          flux: flux,
          link: item.link,
          timestamp: moment(item.date),
          date: moment(item.date).format('DD/MM/YYYY HH:mm'),
          title: item.title,
          categories: item.categories,
          description: item.description
        })
        console.log(moment(item.date).format('DD/MM/YYYY HH:mm') + ' - ' + item.title)
      }
    }
  })
})
