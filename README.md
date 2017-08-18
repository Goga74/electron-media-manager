# electron-media-manager

**How to use mediadevices in WebRTC style in Electron framework.**

This is a simple Electron application based on the [Quick Start Guide](http://electron.atom.io/docs/tutorial/quick-start) within the Electron documentation.
This demo demonstrates how developer can programmatically switches video stream from one device (embbeded webcam, for example) to another
device (for example, USB webcam). 

**Use this app along with the [Electron API Demos](http://electron.atom.io/#get-started) app for API code examples to help you get started.**

This example based on WebRTC code:
https://webrtc.github.io/samples/src/content/devices/input-output/
https://github.com/webrtc/samples/tree/gh-pages/src/content/devices/input-output

A basic Electron application needs just these files:

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `index.html` - A web page to render. This is the app's **renderer process**.

You can learn more about each of these components within the [Quick Start Guide](http://electron.atom.io/docs/tutorial/quick-start).

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/electron/electron-quick-start
# Go into the repository
cd electron-quick-start
# Install dependencies
npm install
# Run the app
npm start
```

## To Build executable
To build executable application should use [electron-packager, Git](https://github.com/electron-userland/electron-packager)
See [electron-packager tutorial](https://www.christianengvall.se/electron-packager-tutorial/)

# build under WIndows example:
electron-packager . --overwrite --asar=true --platform=win32 --arch=ia32 --icon=assets/icons/win/icon.ico --prune=true --out=release-builds --version-string.CompanyName=IgorZamiatin --version-string.FileDescription=IgorZamiatin --version-string.ProductName="electron-media-manager"

[CC0 1.0 (Public Domain)](LICENSE.md)

