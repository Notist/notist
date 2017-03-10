import Annotation from '../models/annotation';
import Article from '../models/article';

import mongodb from 'mongodb';

// direct access to a specific annotation
export const getAnnotation = (user, annotationId) => {
  return Annotation.findById(annotationId)
    .then(annotation => {
      if (annotation === null) {
        throw new Error('Annotation not found');
      }

      let isAuthorized = annotation.isPublic;
      if (user !== null) {
        isAuthorized = isAuthorized || user.isMemberOfAny(annotation.groupIds);
      }

      if (!isAuthorized) {
        throw new Error('Not authorized to access this annotation');
      }

      return annotation;
    });
};

// PRECONDITION: user is not null.
export const createAnnotation = (user, body, articleId) => {
  const annotation = new Annotation();
  annotation.authorId = user._id;
  annotation.text = body.text;
  if (body.parentId) {
    // ensure user is allowed to *read* the parent annotation
    return getAnnotation(user, body.parentId)
      .then(parent => { // inherit properties from parent
        annotation.parent = parent._id;
        annotation.articleText = parent.articleText;
        annotation.articleId = parent.articleId;
        annotation.groupIds = parent.groupIds;
        annotation.isPublic = parent.isPublic;
        return annotation.save();
      })
      .catch(err => {
        const newErr = err;
        newErr.message = `Error getting parent: ${err.message}`;
        throw newErr;
      });
  } else {
    annotation.articleText = body.articleText;
    annotation.articleId = articleId;
    annotation.parent = null;
    annotation.isPublic = body.isPublic;
    annotation.groupIds = body.groupIds;

    if (!body.isPublic && body.groupIds.length > 1) {
      const err = new Error('Cannot assign private annotation to multiple groups');
      return Promise.reject(err);
    }

    // check that user is allowed to post to the groups
    if (!user.isMemberOfAll(annotation.groupIds)) {
      const err = new Error('Not authorized to post to these groups');
      return Promise.reject(err);
    }
    return annotation.save();
  }
};

// TODO: Add filtering, return in order
// TODO: move to article controller
// Get all annotations on an article, accessible by user, optionally in a specific set of groups
// If user is null, return public annotations.
// Returns a promise.
export const getArticleAnnotations = (user, articleId, toplevelOnly) => {
  const conditions = { 'articleId': new mongodb.ObjectId(articleId) };

  if (user === null) {
    conditions.isPublic = true;
  } else {
    conditions.$or = [{ groupIds: { $in: user.groupIds } }, { isPublic: true }];
  }
  if (typeof toplevelOnly !== 'undefined' && toplevelOnly) {
    conditions.parent = null;
  }

  // TODO: Would be amazing if we could get this way of fetching working
  // return Article.findById(articleId)
  //         .populate({
  //           path: 'annotations',
  //           // select: ['articleText', 'text'],
  //           match: conditions })
  //         .then((article) => {
  //           // console.log('populated annotations: ' + annotations);
  //           return article.annotations;
  //         });

  return Annotation.find(conditions);
};

// TODO: Get one level of children down from this instead
// Get top-level annotations on an article, accessible by user, optionally in a specific set of groups
// Equivalent to getArticleAnnotations, but only returns annotations with no ancestors.
// Returns a promise.
export const getTopLevelAnnotations = (user, articleId) => {
  return getArticleAnnotations(user, articleId, true);
};

// Get all replies to parentId (verifying that user has access to this comment)
// Also succeeds if user is null and comment thread is public.
// Returns a promise.
export const getReplies = (user, parentId) => {
  const conditions = { ancestors: { $in: [new mongo.ObjectId(parentId)] } }; // TODO: I hate this whole objectId thing
  if (user === null) {
    conditions.isPublic = true;
  } else {
    conditions.$or = [{ groupIds: { $in: user.groupIds } }, { isPublic: true }];
  }
  return Annotation.find(conditions);
};

// PRECONDITION: user is not null.
export const editAnnotation = (userId, annotationId, updateText) => {
  const conditions = { _id: annotationId, authorId: userId };
  const update = { $set: { text: updateText, editDate: Date.now(), edited: true } };
  return Annotation.findOneAndUpdate(conditions, update, { new: true });
};
