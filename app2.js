const express = require("express");
const mongoConnect = require("./database").mongoConnect;
const getDb = require('./database').getDb;

const app = express();

let friendsResponse = [];
let friendsoffriends = [];


// GET SINGLE USER INFO
app.get("/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const db = getDb();
  let response = [];
  db.collection('people')
  .find({id: userId})
  .toArray()
  .then(result => {
    if(result[0]) {
      response = JSON.stringify({
        "Name": result[0].firstName,
        "Surname": result[0].surname,
        "Age": result[0].age,
        "id": result[0].id
      });
    } else {
      console.log("No user with id: " + req.params.userId);
    }
    res.send(response);
  })
  .catch(err => console.log(err));
});


// DIRECT FRIENDS OF SELECTED USER
app.get("/friends/:userId", (req, res) => {
  friendsResponse = [];
  const userId = parseInt(req.params.userId);
  const db = getDb();
  db.collection('people')
  .find({id: userId})
  .toArray()
  .then(user => {
    if(user[0]) {
      const friends = user[0].friends;
      //console.log(friends);
      console.log("Direct friends of " + userId + ": " + friends);
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
    } else {
      return Promise.reject('No user found with id: ' + req.params.userId);
    }
  })
  .then(result => {
    res.send(result);
  })
  .catch(err => {
    console.log(err);
    res.send([]);
  });
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
    if (user[0]) {
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
    } else {
      return Promise.reject('No user found with id: ' + req.params.userId);
    }
  })
  .then(friends => {
    console.log("Unique friends of friends: " + friends);
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
  .catch(err => {
    console.log(err);
    res.send([]);
  });
});


// SUGGESTED FRIENDS - people in the group who know 2 or more direct friends of the chosen user
// but are not directly connected to the chosen user;
app.get("/suggested/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  let userFriends;
  const db = getDb();
  db.collection('people')
  .find({id: userId})
  .toArray()
  .then(user => {
    if(user[0]) {
      userFriends = user[0].friends;
      console.log(user[0].firstName + "'s (id:" + userId + ") friends: " + userFriends);
      return Promise.resolve([...userFriends]);
    } else {
      return Promise.reject('No user found with id: ' + userId);
    }
  })
  .then(friends => {
    db.collection('people')
    .find({friends: {$in: friends}})
    .toArray()
    .then(users => {
      let selectedFriends = [], suggestedUsers = [];
      users.forEach(user => {
        if (!userFriends.includes(parseInt(user.id)) && (user.id !== userId)) {
          selectedFriends = user.friends.filter(friendId => {
            return (userFriends.includes(parseInt(friendId)));
          });
          if (selectedFriends.length >= 2) {
            suggestedUsers.push({
              "Name": user.firstName,
              "Surname": user.surname,
              "Age": user.age,
              "id": user.id
             })
          }
          console.log(user.firstName + "(id:" + user.id + ") " + " selected friends: " + selectedFriends);
        }
      });
      res.send(suggestedUsers);
    })
    .catch(err => console.log(err));
  })
  .catch(err => {
    console.log(err);
    res.send([]);
  });
});

app.use("/", (req, res) => {
  res.send('<h2>Please enter one of these adresses:</h2><p>/user/&lt;id&gt;, /friends/&lt;id&gt;, /friendsoffriends/&lt;id&gt;, /suggested/&lt;id&gt;</p>');
});

mongoConnect(() => {
  console.log('Example API adresses: http://localhost:3000/user/6 , http://localhost:3000/friends/3 , http://localhost:3000/friendsoffriends/3 , http://localhost:3000/suggested/7');
  app.listen(3000);
});