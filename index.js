var RadarClient = require('radar_client')
var userId = Date.now()
window.foo = RadarClient
window.bs = require('radar_client/node_modules/minilog')
RadarClient.configure({
  host: 'localhost',
  port: 8000,
  secure: false,
  userId: userId,
  userType: 2,
  accountName: 'presents'
})

RadarClient.alloc('test page', function () {
  RadarClient.presence('presents/box-1').on(handleMessage).sync()
  RadarClient.presence('presents/box-2').on(handleMessage).sync()
  RadarClient.presence('presents/box-3').on(handleMessage).sync()
})

var boxes = Array.prototype.slice.call(document.querySelectorAll('.box'))
boxes.forEach(function (box, i) {
  box.id = 'box' + i
  box.presence = 'offline'
  RadarClient.presence(box.id).on(handleMessage).subscribe()
  box.addEventListener('click', onclickBox(box))
})

var clients = {}
global.clients = clients
function handleMessage (message) {
  console.log('message', message)
  switch (message.op) {
    case 'online':
      return ononline(message)
    case 'offline':
      return onoffline(message)
    case 'client_online':
      return onclientOnline(message)
  }
  console.log('unhandled message', message)
}

function onclientOnline (message) {
  var clientId = message.value.userId
  if (!clients[clientId]) {
    clients[clientId] = String(clientId)
    console.log('subscribing to clients/' + clientId)
    RadarClient.status('clients/' + clientId).on(function (x) {
      console.log('sync', x, clients)
      clients[x.key] = x.value
      console.log(clients)
    }).sync()
  } else {
    console.log('client online', clients[clientId])
  }

  console.log('client online', message)
  var box = message.to.slice(19)
  document.querySelector('.' + box).innerText = clients[message.value.userId]
}

document.querySelector('.name').addEventListener('change', function (e) {
  RadarClient.status('clients/' + userId).set(e.target.value)
})

function onclickBox (box) {
  return function handler () {
    box.presence = box.presence === 'offline' ? 'online' : 'offline'
    RadarClient.presence(box.id)
      .set(box.presence)
  }
}

function ononline (message) {
  var id = message.to.slice(19)
  document.querySelector('.' + id).classList.add('present')
  RadarClient.presence(id).sync(console.log.bind(console))
}

function onoffline (message) {
  var id = message.to.slice(19)
  document.querySelector('.' + id).classList.remove('present')
}
