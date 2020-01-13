const express = require("express");
//const bodyParser = require("body-parser");
const mongoConnect = require("./database").mongoConnect;
const getDb = require('./database').getDb;

const app = express();

// app.set("view engine", "ejs");
// app.set("views", "views");

let friendsResponse = [];
let friendsoffriends = [];

// GET SINGLE USER INFO
app.get("/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const db = getDb();
  db.collection('people')
  .find({id: userId})
  .toArray()
  .then(result => { 
    const response = JSON.stringify({
      "Name": result[0].firstName,
      "Surname": result[0].surname,
      "Age": result[0].age,
      "id": result[0].id
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
    let counter = 0;
    return new Promise((resolve, reject) => { 
      friends.forEach((friendId, index, array) => {
        db.collection('people')
        .find({id: friendId})
        .toArray()
        .then(result => {
          friendsResponse.push({
           "Name": result[0].firstName,
           "Surname": result[0].surname,
           "Age": result[0].age,
           "id": result[0].id
          });
          counter++;
          if(counter === array.length) {
            resolve(JSON.stringify(friendsResponse));
          }
        })
      })
    });
  })
  .then(result => {
    res.send(result);
  })
  .catch(err => console.log(err));
});


// FRIENDS OF FRIENDS NOT DIRECTLY CONNECTED TO USER
app.get("/friendsoffriends/:userId", (req, res) => {
  friendsResponse = [];
  friendsoffriends = [];
  const userId = parseInt(req.params.userId);
  const db = getDb();
  db.collection('people')
  .find({id: userId})
  .toArray()
  .then(user => { 
    // Direct friends
    const friends = user[0].friends;
    console.log("Direct friends of " + userId + ": " + friends);
    let counter = 0;
    return new Promise((resolve, reject) => { 
      friends.forEach((friendId, index, array) => {
        db.collection('people')
        .find({id: friendId})
        .toArray()
        .then(result => {
          let fof = result[0].friends.filter(el => {
            if(!friends.includes(el)) {
              friendsoffriends.push(el);
              return el;
            }
          });
          console.log("Friends of " + friendId + ": " + fof);
          counter++;
          if(counter === array.length) {
            let uniqueFriendsOfFriends = [...new Set(friendsoffriends)];
            resolve(uniqueFriendsOfFriends);
          }
        })
      })
    });
  })
  .then(friends => {
    console.log("Unique friends of friends: " + friends); // result for id 20: [ 3, 5, 20, 8, 9, 10, 14, 18 ]
    let counter = 0;
    return new Promise((resolve, reject) => { 
      friends.forEach((friendId, index, array) => {
        db.collection('people')
        .find({id: friendId})
        .toArray()
        .then(result => {
          friendsResponse.push({
           "Name": result[0].firstName,
           "Surname": result[0].surname,
           "Age": result[0].age,
           "id": result[0].id
          });
          counter++;
          if(counter === array.length) {
            resolve(JSON.stringify(friendsResponse));
          }
        })
      })
    });
  })
  .then(result => {
    res.send(result);
  })
  .catch(err => console.log(err));
});

mongoConnect(() => {
  app.listen(3000);
});
