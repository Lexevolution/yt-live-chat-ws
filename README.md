# YTLive chat WebSockets
This is intended to be a WebSocket server that integrates with YouTube livestream chat, with a simplified output for applications which have limited text parsing. This is originally designed for [NeosVR](https://neos.com).

## Download / Install
You can find the latest download on the [releases page](https://github.com/Lexevolution/yt-live-chat-ws/releases).

## Contributing
When contributing, please fork this repo, then create a new branch, then submit a pull request.

### Requirements:
- [Node.js](https://nodejs.org)
- Dev build (or v1.2.0 if released) of [Masterchat](https://github.com/sigvt/masterchat) (included in this repo)

### Setup:
- clone repo (or your fork of the repo):
```
git clone https://github.com/Lexevolution/yt-live-chat-ws.git
```
- Navigate to cloned repo directory and install required node packages
```
npm install
```
- Edit `YTLWS.ts` to your heart's content

### Testing:
- In repo directory, run:
```
npm run debug
```
Then run:
```
node ./dist/YTLWS.cjs
```

### Building:
- In repo directory, run:
```
npm run build
```
Two directories will be created. `dist` and `build`. `dist` contains the bundled, transpiled project, which is what you can use when testing/debugging with node. `build` contains the Windows and Linux binaries.