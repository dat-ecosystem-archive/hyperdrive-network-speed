[![deprecated](http://badges.github.io/stability-badges/dist/deprecated.svg)](https://dat-ecosystem.org/) 

More info on active projects and modules at [dat-ecosystem.org](https://dat-ecosystem.org/) <img src="https://i.imgur.com/qZWlO1y.jpg" width="30" height="30" /> 

---

# hyperdrive-network-speed

[![Travis](https://img.shields.io/travis/datproject/hyperdrive-network-speed.svg?style=flat-square)](https://travis-ci.org/datproject/hyperdrive-network-speed) [![npm](https://img.shields.io/npm/v/hyperdrive-network-speed.svg?style=flat-square)](https://npmjs.org/package/hyperdrive-network-speed)

Get upload and download speeds for a hyperdrive archive.

## Usage

```js
var archive = hyperdrive('.dat')
var swarm = hyperdiscovery(archive)
var speed = networkSpeed(archive, {timeout: 1000})

setInterval(function () {
  console.log('upload speed: ', speed.uploadSpeed)
  console.log('download speed: ', speed.downloadSpeed)
}, 500)
```

## API

### `var speed = networkSpeed(archive, [opts])`

* `archive` is a hyperdrive archive.
* `opts.timeout` is the only option. Speed will be reset to zero after the timeout.

#### `speed.uploadSpeed`

Archive upload speed across all peers.

#### `speed.downloadSpeed`

Archive download speed across all peers.

#### `speed.downloadTotal`

Archive total download.

#### `speed.uploadTotal`

Archive total upload.

## License

MIT
