var assert = require('assert')
var speedometer = require('speedometer')
var debug = require('debug')('dat-network')

module.exports = function (archive, opts) {
  assert.ok(archive, 'archive required')
  opts = opts || {}

  var speed = {}
  var downloadSpeed = speedometer()
  var uploadSpeed = speedometer()
  var timeout = opts.timeout || 1000
  var upTimeout = null
  var downTimeout = null
  var totalTransfer = {
    up: 0,
    down: 0
  }

  if (debug.enabled) {
    setInterval(function () {
      if (totalTransfer.up) debug('Uploaded data:', totalTransfer.up)
      if (totalTransfer.down) debug('Downloaded data:', totalTransfer.down)
    }, 500)
  }

  archive.open(function () {
    archive.metadata.on('download', function (block, data) {
      totalTransfer.down += data.length
      if (!archive.content.blocksRemaining()) return
      ondownload(data.length)
    })

    archive.metadata.on('upload', function (block, data) {
      totalTransfer.up += data.length
      onupload(data.length)
    })

    archive.on('download', function (data) {
      totalTransfer.down += data.length
      if (archive.content.blocks && archive.content.blocksRemaining() === 0) return // TODO: hyperdrive fires download-finished before last download
      ondownload(data.length)
    })

    archive.on('upload', function (data) {
      totalTransfer.up += data.length
      onupload(data.length)
    })

    // Zero out after downloads finishes after update
    archive.metadata.on('update', function () {
      archive.content.once('download-finished', function () {
        if (archive.metadata.blocksRemaining()) return
        downloadSpeed = speedometer()
        if (downTimeout) clearTimeout(downTimeout)
      })
    })

    // Zero out after download finished
    archive.content.once('download-finished', function () {
      downloadSpeed = speedometer()
      if (downTimeout) clearTimeout(downTimeout)
    })
  })

  Object.defineProperty(speed, 'downloadSpeed', {
    get: function () { return downloadSpeed() }
  })

  Object.defineProperty(speed, 'uploadSpeed', {
    get: function () { return uploadSpeed() }
  })

  return speed

  // Zero out for uploads & disconnections
  function downZero () {
    downloadSpeed = speedometer()
    if (downTimeout) clearTimeout(downTimeout)
  }

  function upZero () {
    uploadSpeed = speedometer()
    if (upTimeout) clearTimeout(upTimeout)
  }

  function ondownload (bytes) {
    downloadSpeed(bytes)
    if (downTimeout) clearTimeout(downTimeout)
    downTimeout = setTimeout(downZero, timeout)
  }

  function onupload (bytes) {
    uploadSpeed(bytes)
    if (upTimeout) clearTimeout(upTimeout)
    upTimeout = setTimeout(upZero, timeout)
  }
}
