/* explore.js
*
* File where all functions relating to explore algorithm exists
*
*/

// Note: all the below are TODO.

/*

User Flow:
1) Get Facebook Permissions
2) Compute Explore Number using politecho.com
  -> Explore Number = avg. of (all your friends politecho scores) = about your bubble
    friends politecho scores = calculated via pages they've liked + articles they've shared
    for each article shared by friend on fb
      add to notist db (NOTE: make sure we can add articles without annotations)
      add / update avgUserScore using the users politecho score as calulcated
3) Serve articles
  -> show articles that have avgUserScore in a range of some constant * standardDeviation
*/

/*
* Function that uses politecho.com to determine one's social media bubble, computing
* an average and assigning it to a user
*/
export const computeUserExploreNumber = (user) => {
  // get friends politecho scores, assuming returned as an array
  const friendScores = getAllFriendsScores2();

  // compute average
  let total = 0;
  let num_friends = 0;
  friendScores.forEach(function (score) {
    num_friends++;
    total = total + score;
  });

  // update user
  const explore_num = total / num_friends;
  user.numExplorations = num_friends; // do I need to get User or does this work?
  user.exploreNumber = explore_num;
  user.save();
};

/*
* Every time a user annotates an article, we should re-calculate their average
*/
export const updateUserExploreNumber = (user, value) => {
  const old_avg = user.exploreNumber;
  const new_avg = ((old_avg * user.numExplorations) + value) / (user.numExplorations + 1);

  user.exploreNumber = new_avg;
  user.numExplorations = user.numExplorations + 1;
  user.save();
};

/*
Function to get called when populating the explore feed view
QUESTION: Where are we getting initial data from, facebook ?!

*/
export const populateExploreFeed = () => {};


/*
* An interesting idea is to calculate the standard deviation of values from
* politecho.com and then use that to determine how echo-chambery one's feed already is
* which should dictate where we should recommend articles from
* AKA if someone is used to hearing reaffirming things aka standard deviation of their feed is low,
*   then we don't want to scare them away right off the bat
*/
export const bubbleStandardDeviation = () => {};
