import ajv from 'ajv';
import Task from '../frontend/src/model/task.mjs';
import { ObjectId } from 'mongodb';

function useHabbitHandlers(app, checkJwt, myMongoDBManager) {

  app.get('/habbits', checkJwt, async (req, res) => {
    const userId = req.auth.payload.sub
    console.log(`userId: ${userId}`);
    console.log(`GET request at /habbits from user id: ${userId}`);

    // const taskSchema = Task.getJsonSchema()
    // const ajvInstance = new ajv();
    // const validate = ajvInstance.compile(taskSchema);

    // if(!validate(req.body)) {
    //   console.log('Validation error on task object: ', req.body);
    //   return res.status(400).json( {message: 'Validation errors', errors: validate.errors});
    // }

    const habbits = await myMongoDBManager.find({ user_ids: { $in: [userId] } });
    res.status(200).json(habbits);
  });

  app.put('/habbit', checkJwt, async (req, res) => {
    const userId = req.auth.payload.sub
    console.log(`PUT request from user ${userId} at /habbit with data:`, req.body, '_id:', req.body._id);

    let habbit = null;
    if (req.body._id !== undefined) {
      habbit = (await myMongoDBManager.find({_id:req.body._id}))[0];
      console.log('Habbitttt', habbit);
    }

    if(habbit) {
      console.log("Habbit exists", habbit);
      const changes = {};
      for (const key in req.body) {
        // Here if there is an incomming key that is _id, then we have the raw string version, comparing it with the new one.
        if (req.body[key] !== habbit[key]) {
          console.log(`Key: ${key}, old value: ${habbit[key]}, new value: ${req.body[key]}`);
        changes[key] = req.body[key];
        }
      }
      delete changes._id;
      console.log("Changes:", changes);
      await myMongoDBManager.update({_id: habbit._id}, changes);
    } else {
      console.log('Inserting new habbit');
      let object = req.body;
      object.user_ids = [userId];
      await myMongoDBManager.insert(object);
    }

    res.status(200).json({ message: 'Habbit updated successfully' });
  });

  app.delete('/habbit', checkJwt, async (req, res) => {
    const userId = req.auth.payload.sub;

    console.log(`DELETE request from user: ${userId} at /habbit, id:` + req.query.habbitId);
    myMongoDBManager.delete({ _id: req.query.habbitId });
    res.status(200).json({ message: 'Habbit deleted successfully' });
  });

  app.put('/habbit_invite', checkJwt, async (req, res) => {
    console.log('PUT request at /habbit_invite with body:', req.body, "query:", req.query);
    const userId = req.auth.payload.sub
    const requestedUserId = req.body.friend_id;
    const habbit = req.body.habbit;
    // await myMongoDBManager.push({ _id: new ObjectId(habbit._id)}, userId, 'user_ids');
    await myMongoDBManager.push({ _id: new ObjectId(habbit._id) }, requestedUserId,'observer_ids');

    res.status(200).json({ message: 'Habbit invited successfully' });
  });
}

export default useHabbitHandlers;