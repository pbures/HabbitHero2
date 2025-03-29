/* An example data item of a single habbit */

class Task {
    constructor(
      { _id = null,
        schema_version = "1.0",
        title,
        description,
        user_ids = [],
        type = "habbit",
        expiration_date = "",
        target,
        numer_of_events_in_one_go,
        status = "",
        status_date = "",
        events = [],
        total_event_count = 0,
        habbit_interval = "days_in_week",
        days_in = [],
      } = {}
    ) {
        this._id = _id;
        this.schema_version = schema_version;
        this.title = title;
        this.description = description;
        this.user_ids = user_ids;
        this.type = type;
        this.expiration_date = expiration_date;
        this.target = target;
        this.numer_of_events_in_one_go = numer_of_events_in_one_go;
        this.status = status;
        this.status_date = status_date;
        this.events = events;
        this.total_event_count = total_event_count;

        this.habbit_interval = habbit_interval;
        this.days_in = days_in;
    };

    static createExampleInstance() {
      return new Task({
        title: "Example title",
        description: "Example habbit and tasks",
      })
    }

    static getJsonSchema(){
      return {
        type: "object",
        properties: {
          _id: { type: "integer" },
          schema_version: { type: "string" },
        }
      }
    };
}

export default Task;

/*
Habbit:
 - This is a repetitive task, the goal is the regularity.

 - Scheduled Days:
 -- Days in week
 -- Days in month

Goal:
 - target: number of events in total to reach
*/

// export default {
//     _id: 1,
//     schema_version: "1.0",

//     /* Title of the habbit, Max 16 characters */
//     title: "Eat vegetables",

//     description: "I will eat vegetables at least four times a week",

//     /* User IDs of the owners of the habbit. Habbits can be shared amongst more users */
//     user_ids: [1, 2],

//     /* allowed values: goal or habbit */
//     type: "goal",

//     /* Expiration date of the goal or habbit. This is to set a time limited goals or habbits */
//     expiration_date: "2023-12-31",

//     /* Number of repetitions. Applicable only for type: goal. */
//     target: 20,

//     /* How many events (like exercises) can you add at once?
//        Example: If the goal is number of pushups, one can add 30 pushups done.
//        If the goal is to go to training, one can add one training only.
//     */
//     numer_of_events_in_one_go: 1,

//     /* Status of the habbit.
//        allowed values: active - currently user is working on that,
//                        idle - habbit was defined, but not started yet,
//                        completed - habbit was successfully completed,
//                        failed - habbit was failed.
//                        deleted - habbit was deleted, is kept of recovery.
//     */
//     status: "active",

//     /* A date when the status was changed to it's last state */
//     status_date: "2023-10-01",

//     /* Inline list of events.
//        Every record of 1..n events is done by a singler user.
//     */
//     events: [
//         {
//             _id: 1,
//             user_id: 1,
//             num_of_events: 2,
//             /* Time is in UTC */
//             date: "2023-10-01T10:00:00Z"
//         },
//         {
//             _id: 2,
//             user_id: 2,
//             num_of_events: 1,
//             /* Time is in UTC */
//             date: "2023-10-03T10:00:00Z"
//         },
//     ],

//     /* Precomputed number of events in total */
//     total_event_count: 3,
// }
