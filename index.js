var assert = require('assert')
var speedometer = require('speedometer')

module.exports = function (archive, opts) {
  assert.ok(archive, 'archive required')
  opts = opts || {}

  var speed = {}
  var downloadSpeed = speedometer()
  var uploadSpeed = speedometer()
  var timeout = opts.timeout || 500
  var upInterval = null
  var downInterval = null

  archive.on('download', function (data) {
    downloadSpeed(data.length)
    if (downInterval) clearInterval(downInterval)
    downInterval = setInterval(downTimeout, timeout)
  })

  archive.on('upload', function (data) {
    uploadSpeed(data.length)
    if (upInterval) clearInterval(upInterval)
    upInterval = setInterval(upTimeout, timeout)
  })

  // Zero out for uploads & disconnections
  var downTimeout = function () {
    downloadSpeed = speedometer()
    if (downInterval) clearInterval(downInterval)
  }
  var upTimeout = function () {
    uploadSpeed = speedometer()
    if (upInterval) clearInterval(upInterval)
  }

  // Zero out for downloads
  archive.metadata.on('update', function () {
    archive.open(function () {
      archive.content.once('download-finished', function () {
        downloadSpeed = speedometer()
        if (downInterval) clearInterval(downInterval)
      })
    })
  })

  Object.defineProperty(speed, 'downloadSpeed', {
    get: function () { return downloadSpeed() }
  })

  Object.defineProperty(speed, 'uploadSpeed', {
    get: function () { return uploadSpeed() }
  })

  return speed
}
