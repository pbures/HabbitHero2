import ajv from 'ajv';
import { ObjectId } from 'mongodb';
import Task from '../frontend/src/model/task.mjs';

function useHabbitHandlers(app, myMongoDBManager) {

  app.get('/habbits', async (req, res) => {
    const userId = req.auth.payload.sub

    /* TODO: Move that into a middleware, for testing mode */
    console.log(`GET request at /habbits from user id: ${userId}`);

    // const taskSchema = Task.getJsonSchema()
    // const ajvInstance = new ajv();
    // const validate = ajvInstance.compile(taskSchema);

    // if(!validate(req.body)) {
    //   console.log('Validation error on task object: ', req.body);
    //   return res.status(400).json( {message: 'Validation errors', errors: validate.errors});
    // }

    /* Find habbits which user owns, start putting them into unique map based on it's _id */
    const uniqueHabbits = new Map();

    let habbits = await myMongoDBManager.find(
      { user_ids: { $in: [userId] } }
    );
    if (habbits) {
      habbits.forEach(habbit => {
        const habbitIdStr = habbit._id.toString();
        if (!uniqueHabbits.has(habbitIdStr)) {
          uniqueHabbits.set(habbitIdStr, habbit);
        }
      });
    }

    /* Find habbits where the user is an observer.
       Ensure that non of the habbits is contained in the habbits array twice, based on _id property
    */
    const habbitsOfFriends = await myMongoDBManager.find({ observer_ids: { $in: [userId] } });

    if(habbitsOfFriends) {
      habbitsOfFriends.forEach(habbit => {
        const habbitIdStr = habbit._id.toString();
        if (!uniqueHabbits.has(habbitIdStr)) {
          habbit.is_observer = true;
          uniqueHabbits.set(habbitIdStr, habbit);
        }
      });
    }

    habbits = Array.from(uniqueHabbits.values());
    console.log('Habbits:', habbits);
    res.status(200).json(habbits);
  });

  app.put('/habbit', async (req, res) => {
    const userId = req.auth.payload.sub
    console.log(`PUT request from user ${userId} at /habbit with data:`, req.body, '_id:', req.body._id);


    const schema = Task.getJsonSchema();
    /* Validate the payload of the request against the schema using AJV */
    const ajvInstance = new ajv();
    const validate = ajvInstance.compile(schema);
    const valid = validate(req.body);

    if (!valid) {
      console.log('Validation errors:', validate.errors);
      return res.status(400).json({ message: 'Validation errors', errors: validate.errors });
    }
    /*


    */
    /* TODO: Verify the data is as expected in the request body */
    const habbitId = req.body._id;

    let habbit = null;
    if ((req.body._id !== undefined) && (req.body._id !== null)) {
      habbit = (await myMongoDBManager.find({_id:new ObjectId(habbitId)}))[0];
    }
    if(habbit) {
      // habbit exists
      console.log("Habbit exists", habbit);
      if(!habbit.user_ids.includes(userId)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
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
      // Habbit does not exist, create a new one
      console.log('Inserting new habbit');
      let object = req.body;
      object.user_ids = [userId];
      await myMongoDBManager.insert(object);
    }

    res.status(200).json({ message: 'Habbit updated successfully' });
  });

  app.post('/tasks_reset', async (req, res) => {
    console.log('POST request at /tasks_reset');

    if (process.env.MODE=='testing') {
      console.log('Resetting tasks database');
      await myMongoDBManager.database.dropCollection('habbits');
      res.status(200).json({ message: 'Tasks database reset successfully' });
    }
    else {
      res.status(403).json({ message: 'Forbidden' });
    }
  });

  app.delete('/habbit', async (req, res) => {
    const userId = req.auth.payload.sub;
    // let habbit = (await myMongoDBManager.find({_id:new ObjectId(req.query.habbit_id)}))[0];
    let habbit = await myMongoDBManager.findOne({_id: new ObjectId(req.query.habbitId)})
    if(!habbit) {
      return res.status(400).json({ message: 'Habbit not found' });
    }

    //test if habbit has user_ids array
    if(!Array.isArray(habbit.user_ids)) {
      return res.status(422).json({ message: 'Internal server error: habbit user_ids is not an array' });
    }

    if(!habbit.user_ids.includes(userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    console.log(`DELETE request from user: ${userId} at /habbit, id:` + req.query.habbitId);
    await myMongoDBManager.delete({ _id: new ObjectId(req.query.habbitId) });
    res.status(200).json({ message: 'Habbit deleted successfully' });
  });

  app.put('/habbit_invite', async (req, res) => {
    console.log('PUT request at /habbit_invite with body:', req.body, "query:", req.query);
    const userId = req.auth.payload.sub
    const requestedUserId = req.body.friend_id;
    const habbitId = req.body.habbit_id;
    // await myMongoDBManager.push({ _id: new ObjectId(habbit._id)}, userId, 'user_ids');
    await myMongoDBManager.push({ _id: new ObjectId(habbitId) }, requestedUserId,'observer_ids');

    res.status(200).json({ message: 'Habbit invited successfully' });
  });
}

export default useHabbitHandlers;
