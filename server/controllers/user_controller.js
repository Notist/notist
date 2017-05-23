import User from '../models/user';

// TODO: addFollowing (add a user to the list of user's i am following)


export const getUsers = (req, res) => {
  res.send('getting users');
};

export const addUserGroups = (userId, groupIds) => {
  return User.findByIdAndUpdate(userId, { $addToSet: { groups: { $each: groupIds } } }, { new: true });
};

export const addUserGroup = (userId, groupId) => {
  return addUserGroups(userId, [groupId]);
};

export const removeUserGroup = (userId, groupId) => {
  return User.findByIdAndUpdate(userId, { $pull: { groups: groupId } }, { new: true });
};

export const postUserExploreNumber = (userId, exploreNum, stdDev) => {
  return User.findByIdAndUpdate(userId, { exploreNumber: exploreNum, exploreStandardDev: stdDev, numExplorations: 20 }, { new: true });
};

export const updateUserExploreNumber = (userId, value) => {
  return User.findById(userId)
  .then((user) => {
    const oldAvg = user.exploreNumber;
    const newAvg = ((oldAvg * user.numExplorations) + value) / (user.numExplorations + 1);
    user.exploreNumber = newAvg;
    user.numExplorations = user.numExplorations + 1;
    return user.save();
  });
};

export const updateUserInfo = (userId, value) => {
  Object.keys(value).forEach((key) => {
    if (key != 'bio' && key != 'email' && key != 'name') {
      delete value[key];
    }
  });
  return User.findByIdAndUpdate(userId, value, { new: true });
};
