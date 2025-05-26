class User {
  constructor({_id = null, schema_version = "1.0", user_id, name, nickname, email, invites_sent = [], invites_received = [], friends = []} = {}) {

    if (_id != null) {
      this._id = _id;
    }

    this.user_id = user_id;
    this.schema_version = schema_version;
    this.name = name;
    this.nickname = nickname;
    this.email = email;
    this.invites_sent = invites_sent;
    this.invites_received = invites_received;
    this.friends = friends;
  }

  static createExampleInstance() {
    return new User({
      _id: 1,
      schema_version: "1.0",
      user_id: "example_user_id",
      name: "John Doe",
      nickname: "Johnny",
      email: "john.doe@example.com",
      invites_sent: [],
      invites_received: [],
      friends: []
    });
  }

  static getJsonSchema() {
    return {
      type: "object",
      properties: {
        _id: { type: ["integer", "null"] },
        schema_version: { type: "string" },
        user_id: { type: "string" },
        name: { type: "string" },
        nickname: { type: "string" },
        email: { type: "string"},
        invites_sent: {
          type: "array",
          items: { type: "string" }
        },
        invites_received: {
          type: "array",
          items: { type: "string" }
        },
        friends: {
          type: "array",
          items: { type: "string" }
        },
      },
      required: ["name", "nickname", "email", "schema_version", "invites_sent", "invites_received", "friends"],
      additionalProperties: false
    };
  }

  toString() {
    return `User {
      _id: ${this._id},
      user_id: ${this.user_id},
      schema_version: ${this.schema_version},
      name: ${this.name},
      nickname: ${this.nickname},
      email: ${this.email},
      invites_sent: ${JSON.stringify(this.invites_sent)},
      invites_received: ${JSON.stringify(this.invites_received)},
      friends: ${JSON.stringify(this.friends)},
    }`;
  }

}

export default User;
