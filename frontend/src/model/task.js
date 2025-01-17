/* An example data item of a single habbit */

class Task {
    constructor() {
        this._id;
        this.schema_version = "";
        this.title = "";
        this.description = "";
        this.user_ids = [];
        this.type = "";
        this.expiration_date = "";
        this.target = undefined
        this.numer_of_events_in_one_go = undefined
        this.status = "";
        this.status_date = "";
        this.events = [];
        this.total_event_count = undefined
    }
}

export default Task;

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