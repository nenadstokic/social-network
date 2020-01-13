var MongoClient = require('mongodb').MongoClient;

function findById(id, callback) {
  
  MongoClient.connect("mongodb+srv://nenad:DicaBoga_2020_mongo@cluster0-dlyqr.mongodb.net/test?retryWrites=true&w=majority", {useUnifiedTopology: true}, function (err,client) {
  //MongoClient.connect("mongodb://localhost:27017", {useUnifiedTopology: true}, function (err,client) {
    if (err) {
      return console.dir(err);
    }
    var db = client.db('test');
      db.collection('people').find({"id": {$in:id}}).toArray(function (err, items) {
      //db.collection('people').findOne({"id": id}, function (err, item) {
      return callback(items);     
    });
  });
}

function findDirectFriends(id, callback) {
  this.findById(id, function(item) {
    return callback(item[0].friends); //array
  });
}

function findFriendsOfFriends(id, callback) {
  this.findDirectFriends(id, function(fIDs){
    MongoClient.connect("mongodb://localhost:27017", {useUnifiedTopology: true}, function (err,client) {
      if (err) {
        return console.dir(err);
      }
      var db = client.db('test');
        db.collection('people').find({"id": {$in:fIDs}}).toArray(function (err, items) {
          items.forEach(item => {
            db.collection('people').find({"id": {$in:item.friends}}).toArray(function (err, items2){
              return callback(items2); 
            });
          });
        });
      });
   });
}

module.exports = {
  findById,
  findDirectFriends,
  findFriendsOfFriends
};