require('leaked-handles')
var test = require('tape')
var hyperdrive = require('hyperdrive')
var memdb = require('memdb')
var hyperdiscovery = require('hyperdiscovery')
var raf = require('random-access-file')

var networkSpeed = require('.')

var drive = hyperdrive(memdb())
var archive = drive.createArchive({
  file: function (name) {
    return raf(name)
  }
})
var swarm = hyperdiscovery(archive)

archive.append('test.js', function (err) {
  if (err) throw err
  tests()
})

function tests () {
  test('tracks upload speed', function (t) {
    var speed = networkSpeed(archive)

    var driveClient = hyperdrive(memdb())
    var archiveClient = driveClient.createArchive(archive.key)
    var swarmClient = hyperdiscovery(archiveClient)

    archive.once('upload', function () {
      t.ok(speed.uploadSpeed && speed.uploadSpeed > 0, 'has upload speed')
      archiveClient.close(function () {
        swarmClient.close(function () {
          t.end()
        })
      })
    })
  })

  test('tracks download speed', function (t) {
    var driveClient = hyperdrive(memdb())
    var archiveClient = driveClient.createArchive(archive.key)
    var swarmClient = hyperdiscovery(archiveClient)

    var speed = networkSpeed(archiveClient)

    archiveClient.once('download', function () {
      t.ok(speed.downloadSpeed && speed.downloadSpeed > 0, 'has download speed')
      archiveClient.close(function () {
        swarmClient.close(function () {
          t.end()
        })
      })
    })
  })

  test('zeros out speed after finishing', function (t) {
    var driveClient = hyperdrive(memdb())
    var archiveClient = driveClient.createArchive(archive.key)
    var swarmClient = hyperdiscovery(archiveClient)

    var speedDown = networkSpeed(archiveClient)

    archiveClient.open(function (err) {
      if (err) throw err
      archiveClient.content.once('download-finished', function () {
        t.ok(speedDown.downloadSpeed === 0, 'download speed zero')
        archiveClient.close(function () {
          swarmClient.close(function () {
            t.end()
          })
        })
      })
    })
  })

  test('zeros out speed after disconnection', function (t) {
    var driveClient = hyperdrive(memdb())
    var archiveClient = driveClient.createArchive(archive.key)
    var swarmClient = hyperdiscovery(archiveClient)

    var speedUp = networkSpeed(archive)
    var speedDown = networkSpeed(archiveClient)

    archiveClient.once('download', function () {
      archive.append('index.js', function () {
        // make sure not all of it is downloaded before disconnection
        setTimeout(function () {
          t.ok(speedUp.uploadSpeed === 0, 'upload speed zero')
          t.ok(speedDown.downloadSpeed === 0, 'download speed zero')

          archiveClient.close(function () {
            swarmClient.close(function () {
              archive.close(function () {
                swarm.close(function () {
                  t.end()
                })
              })
            })
          })
        }, 1000)
      })
      swarmClient.leave(archive.key)
    })
  })
}
