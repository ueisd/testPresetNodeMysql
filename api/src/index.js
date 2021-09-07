const express = require('express');
const MongoClient = require('mongodb').MongoClient;
var path = require('path');

const host = 'us-cdbr-east-04.cleardb.com';
const user = 'b427f8896f0ef8';
const password = 'd3c978e1';
const database = 'heroku_f8244a62bf3df81';

const Importer = require('mysql-import');
const importer = new Importer({host, user, password, database});

var Activity = require('./database/models/activity.model');

let count;
let connectedClient;

const MongUrl =
  process.env.NODE_ENV === 'production'
    ? `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PWD}@db`
    : `mongodb://db`;

// console.log("---------------------------------------------------------------");
// console.log(process.env.NODE_ENV);
// console.log(MongUrl);




// New onProgress method, added in version 5.0!
importer.onProgress(progress=>{
  var percent = Math.floor(progress.bytes_processed / progress.total_bytes * 10000) / 100;
  console.log(`${percent}% Completed`);
});

importer.import('src/database/database_shema.init.sql').then(()=>{
  var files_imported = importer.getImported();
  console.log(`${files_imported.length} SQL file(s)1 imported.`);
}).catch(err=>{
  console.error(err);
});









MongoClient.connect(MongUrl, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log(err);
  } else {
    console.log('CONNEXION DB OK !');
    connectedClient = client;
    count = client.db('test').collection('count');
  }
});

const app = express();

app.get('/api/count', (req, res) => {
  count
    .findOneAndUpdate({}, { $inc: { count: 1 } }, { returnNewDocument: true })
    .then((doc) => {
      const count = doc.value;
      res.status(200).json("count.count :)");
    });
});

app.get('/', (req, res) => {
  /*Activity.getAllActivitys()
  .then(data => {
    res.status(200).json(data);
  }).catch(err => {
    console.log(err);
    res.status(404).end(err);
  })*/
})

app.all('*', (req, res) => {
  res.status(404).end();
});

const server = app.listen(80);

// Graceful shutdown.
// On empêche les nouvelles connexions sur le serveur
// Ensuite on close proprement la connexion DB
process.on('SIGINT', () => {
  server.close((err) => {
    if (err) {
      process.exit(1);
    } else {
      if (connectedClient) {
        connectedClient.close((err) => {
          process.exit(err ? 1 : 0);
        });
      } else {
        process.exit(0);
      }
    }
  });
});