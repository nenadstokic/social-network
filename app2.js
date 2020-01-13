const express = require("express");
const bodyParser = require("body-parser");
//const mongodb = require('mongodb');
const mongoConnect = require("./database").mongoConnect;
const getDb = require('./database').getDb;

const app = express();

// app.set("view engine", "ejs");
// app.set("views", "views");

var friendsResponse = [];

// GET SINGLE USER INFO
app.get("/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const db = getDb();
  db.collection('people')
  .find({id: userId})
  .toArray()
  .then(result => { 
    console.log(result);
    const response = JSON.stringify({
      "Name": result[0].firstName,
      "Surname": result[0].surname,
      "Age": result[0].age
    });
    res.send(response);
  })
  .catch(err => console.log(err));
});

// DIRECT FRIENDS OF SELECTED PERSON
app.get("/friends/:userId", (req, res) => {
  friendsResponse = [];
  const userId = parseInt(req.params.userId);
  const db = getDb();
  db.collection('people')
  .find({id: userId})
  .toArray()
  .then(user => { 
    const friends = user[0].friends;
    console.log(friends);
    var counter = 0;
    return new Promise((resolve, reject) => { // obećanje ludom radovanje :D
      friends.forEach((friendId, index, array) => {
        db.collection('people')
        .find({id: friendId})
        .toArray()
        .then(result => {
          friendsResponse.push({
           "Name": result[0].firstName,
           "Surname": result[0].surname,
           "Age": result[0].age
          });
          counter++;
          console.log("push new friend" + result[0].firstName);
          if(counter === array.length) {
            resolve(JSON.stringify(friendsResponse));
          }
        })
      })
    });
    
    // setTimeout(() => {
    //   console.log(friendsResponse);
    // }, 5000);

    // const response = JSON.stringify({
    //   "Name": result[0].firstName,
    //   "Surname": result[0].surname,
    //   "Age": result[0].age
    // });
    //res.send(JSON.stringify(friendsResponse));
  })
  .then(result => {
    res.send(result);
  })
  .catch(err => console.log(err));
});

function returnFriends(r) {
  //console.log(r);
  //res.send(JSON.stringify(friendsResponse));
}

mongoConnect(() => {
  app.listen(3000);
});
