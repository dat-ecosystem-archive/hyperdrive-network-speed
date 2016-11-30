var assert = require('assert')
var speedometer = require('speedometer')

module.exports = function (archive, opts) {
  assert.ok(archive, 'archive required')
  opts = opts || {}

  var speed = {}
  var downloadSpeed = speedometer()
  var uploadSpeed = speedometer()
  var timeout = opts.timeout || 500
  var upTimeout = null
  var downTimeout = null

  archive.on('download', function (data) {
    downloadSpeed(data.length)
    if (downTimeout) clearTimeout(downTimeout)
    downTimeout = setTimeout(downZero, timeout)
  })

  archive.on('upload', function (data) {
    uploadSpeed(data.length)
    if (upTimeout) clearTimeout(upTimeout)
    upTimeout = setTimeout(upZero, timeout)
  })

  // Zero out for uploads & disconnections
  var downZero = function () {
    downloadSpeed = speedometer()
    if (downTimeout) clearTimeout(downTimeout)
  }
  var upZero = function () {
    uploadSpeed = speedometer()
    if (upTimeout) clearTimeout(upTimeout)
  }

  // Zero out for downloads
  archive.metadata.on('update', function () {
    archive.open(function () {
      archive.content.once('download-finished', function () {
        downloadSpeed = speedometer()
        if (downTimeout) clearTimeout(downTimeout)
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
