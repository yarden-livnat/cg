# CommonGround 


### Database schema

tbd


### Installation
#### Server
Install [node.js](https://nodejs.org/en/download): 
```shell
cd server
npm install
```

The server works with an sqlite database though it's very simple to adopt it to work with other SQL databases. The server expects the db at `$CG_DIR/cg.sqlite`.

#### Web-app
Add './node_modules/.bin' to your PATH, e.g. `export PATH=./node_modules/.bin:$PATH`

```shell
cd app
npm install
jspm install
```

### Running CommonGround
Start the server
```
cd server;
CG_DIR=<path-to-your-cg.sqlite> node server.js   // or add CG_DIR to your environment
```
Open a browser and point it to localhost:4000

## User Interactions
tdb


