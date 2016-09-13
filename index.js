var express = require('express')
  , app = express()
  , server = require('http').Server(app)
  , bodyParser = require('body-parser')
  , webapp = express.Router()
  , api = express.Router()
  , config = require('./lib/config')
  , webRoutes = require('./lib/web')
  , apiRoutes = require('./lib/api')
  ;

//app.enable('view cache');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Don't try to serve a favicon
app.use(function (req, res, next) {
  if (req.url === "/favicon.ico") {
    return res.status(200).send('');
  }
  return next();
});


// API
//api.get('/pause', apiRoutes.pause);
//api.get('/stop', apiRoutes.stop);
//api.get('/status', apiRoutes.getStatus);
//api.post('/position', apiRoutes.setPosition);
//api.post('/upload/:id', upload.single('file'), apiRoutes.upload);
//api.get('/delete/:id', apiRoutes.deleteMovie);
//api.get('/create-dir/:id', apiRoutes.createDir);


// WEBAPP
//webapp.get('/list/:id?', webRoutes.list);
//webapp.get('/play/:id', webRoutes.play);
//webapp.get('/current', webRoutes.current);
//webapp.get('/shutdown', webRoutes.shutdown);
//webapp.get('/shutdown/confirm', webRoutes.shutdownConfirm);

webapp.post('/payment', webRoutes.payment);



// Declare subrouters
app.use('/api', api);
app.use('/web', webapp);


// Serve static client-side js and css
app.get('/assets/*', function (req, res) {
  res.sendFile(process.cwd() + req.url);
});

// Root
app.get('/', function (req, res) { return res.send('bloup');


        return res.redirect(302, '/web/list'); });


console.log("Express app defined");
server.listen(config.serverPort, function () {
  console.log("Server launched, ready to accept connections");
});
