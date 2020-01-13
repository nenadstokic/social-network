var db = require('./db');

const selectionId = 6;

db.findById([selectionId], function(people) {
  console.log('\n* SELECTED PERSON *');
  people.forEach(function(person){
    console.log(person.firstName + " " + person.surname + " (id: " + person.id + ")");
  });
});

db.findDirectFriends([selectionId], function(friendIDs){

  db.findById(friendIDs, function(friends) {
    console.log('\n* DIRECT FRIENDS *');
    friends.forEach(function(friend){
      console.log(friend.firstName + " " + friend.surname + " (id: " + friend.id + ")");
    });
  });
});

db.findFriendsOfFriends([selectionId], function(allFof){
  console.log('\n* FRIENDS OF FRIENDS *');
  allFof.forEach(friend => {
    console.log(friend.firstName + " " + friend.surname + " (id: " + friend.id + ")");
  })
});
