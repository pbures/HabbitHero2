/* An example data item of a single habbit */

export default {
    _id: 1,
    schema_version: "1.0",
    title: "Eat vegetables 4 times a week",
    description: "I will eat vegetables at least four times a week",

    /* User IDs of the owners of the habbit. Habbits can be shared amongst more users */
    user_ids: [1, 2],

    /* allowed values: regular, or anytime */
    repetition_type: "regular", 

    /* Expiration date of the habbit. This is to set a time limited goals */
    expiration_date: "2023-12-31T23:59:59Z",

    /* Number of repetitions. 
       If set to 0, it means regularity is the target 
       (applicable only on repetition_type: regular). 
    */
    target: 20,

    /* How many events (like exercises) can you add at once?
       Example: If the goal is number of pushups, one can add 30 pushups done.
       If the goal is to go to training, one can add one training only.
    */
    numer_of_events_in_one_go: 1,

    /* Status of the habbit. 
       allowed values: active - currently user is working on that,
                       idle - habbit was defined, but not started yet,
                       completed - habbit was successfully completed,
                       failed - habbit was failed.
                       deleted - habbit was deleted, is kept of recovery.
    */
    status: "active",

    /* A date when the status was changed to it's last state */
    status_date: "2023-10-01T10:00:00Z",

    /* Inline list of events.
       Every record of 1..n events is done by a singler user.
    */
    events: [
        {
            _id: 1,
            user_id: 1,
            num_of_events: 2,
            /* Time is in UTC */
            date: "2023-10-01T10:00:00Z"
        },
        {
            _id: 2,
            owner_id: 2,
            num_of_events: 1,
            /* Time is in UTC */
            date: "2023-10-03T10:00:00Z"
        },
    ],

    /* Precomputed number of events in total */
    total_event_count: 3,
}