# CommonGround 



### Installation
#### Server
* Ensure [node.js](https://nodejs.org) is installed on your machine. CommonGround was built using Node(6.2.0) and npm(3.8.9). Previous versions may or may not work.
* Run `npm install` in the server directory

*Note*: The server is designed to work with an sqlite database (see schema description bellow), though it's very simple to adopt it to work with other SQL databases. 
The server expects the db at `../data/cg.sqlite` or `$CG_DIR/cg.sqlite`.

#### Web-app
*Note:* add *./node_modules/.bin* to your PATH, e.g. `PATH=./node_modules/.bin:$PATH`, in order to use the local jspm tool (ver +17.2). 

```shell
cd app
npm install
jspm install
```

## Running CommonGround
1. Start the server
```
cd server
CG_DIR=<path-to-the-db-directory> node server.js   // or add CG_DIR to your environment.
```
2. Open a browser and point it to localhost:4000

## User Interactions
tdb

### Database schema

tbd




