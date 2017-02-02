import Group from '../models/group';

export const createGroup = (req, res) => {
  const group = new Group();
  group.name = req.body.name;
  group.description = req.body.description;
  group.creator = req.body.creator;
  group.createDate = req.body.createDate;
  group.editDate = req.body.editDate;

  group.articleIds = req.body.articleIds;
  group.members = req.body.members;
//halp

  group.save()
      .then(result => {
	res.json({ message: 'Group created' });
      })
      .catch(error => {
	res.json({ error });
      });
};

export const getGroup = (req, res) => {
  res.send('blah blah');
}
