class AuthFeatures {
  constructor(users, verUser) {
    this.users = users;
    this.verUser = verUser;
  }

  find() {
    this.users = this.users.find({ email: this.verUser.email });

    return this;
  }
}

module.exports = AuthFeatures;
