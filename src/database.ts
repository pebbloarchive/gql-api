import { MongoClient, collection } from 'mongodb';
import Logger from '@pebblo/logger';

export default class Database {
  url: string;
  client: MongoClient;
  posts: collection;
  users: collection;
  messages: collection;
  invites: collection;
  tokens: collection;
  constructor(url: string) {
    this.url = url;
    this.client = new MongoClient(this.url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  }

  async connect() {
    if (this.client.isConnected()) {
      return Logger('DB', 'There is a connection already open to the database.', true, ['red', 'red']);
    }

    await this.client.connect();
    this.users = this.client.db('pebblo').collection('users');
    this.posts = this.client.db('pebblo').collection('posts');
    this.messages = this.client.db('pebblo').collection('messages');
    this.invites = this.client.db('pebblo').collection('invites');
    this.tokens = this.client.db('pebblo').collection('tokens');
    return Logger('DB', `Connected to MongoDB\n`, false, ['green']);
  }
}

module.exports = Database;
