import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  // TODO: Some of these need to be required fields
  googleId: String,
  facebookId: String,
  name: String,
  username: { type: String, unique: true },
  email: String,
  groupIds: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
});

userSchema.methods.isMemberOf = function isMemberOf(groupId) {
  return this.groupIds.includes(groupId);
};

userSchema.methods.isMemberOfAll = function isMemberOfAll(groupIds) {
  return groupIds.every(this.isMemberOf, this);
};

const UserModel = mongoose.model('User', userSchema);

export default UserModel;