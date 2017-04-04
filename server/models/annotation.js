import mongoose, { Schema } from 'mongoose';
import Article from './article';
import User from './user';
import Group from './group';

mongoose.Promise = global.Promise;

const ObjectId = Schema.Types.ObjectId;

// sub-schema for "ranges" entries
const rangeSchema = new Schema({
  start: String,
  end: String,
  startOffset: Number,
  endOffset: Number,
}, { _id: false });

// TODO: change names of fields to not have "Id" in them
const annotationSchema = new Schema({
  author: { type: ObjectId, ref: 'User' },
  username: String,
  article: { type: ObjectId, ref: 'Article' },
  parent: { type: ObjectId, ref: 'Annotation' },
  groups: [{ type: ObjectId, ref: 'Group' }],
  isPublic: { type: Boolean, default: true },
  text: { type: String, trim: true },
  articleText: String,
  ranges: [rangeSchema],
  // TODO: implement system for locating article text robustly
  points: { type: Number, default: 0 },
  createDate: { type: Date, default: Date.now },
  editDate: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
});

// Enforce that private annotations have exactly one group.
annotationSchema.pre('save', function preSave(next) {
  // if annotation is reply, update fields accordingly
  if (this.parent) {
    const parent = Annotation.findById(this.parent);
    this.article = parent.article;
    this.articleText = parent.articleText;
    this.ranges = parent.ranges;
    this.isPublic = parent.isPublic;
    this.groups = parent.groups;
  }

  // check if user can indeed save to these groups
  let err = null;
  // const user = User.findById(this.author);
  if (!this.author.isMemberOfAll(this.groups)) {
    err = new Error('User not authorized to add annotation to one or more groups');
  }

  if (!this.isPublic && this.groups.length > 1) {
    err = new Error('Cannot assign private annotation to multiple groups');
  }

  if (err != null) {
    next(err);
  } else {
    next();
  }
});

annotationSchema.post('save', (doc, next) => {
  // Save annotation to article

  // Save annotation to group

  // if (doc.parent == null) {
  //   // Save article to group
  //   Article.addArticleGroups(doc.article, doc.groups);
  // }

  next();
});

annotationSchema.methods.isTopLevel = function isTopLevel() {
  return this.parent === undefined; // TODO: make sure this works
};


const AnnotationModel = mongoose.model('Annotation', annotationSchema);

export default AnnotationModel;
