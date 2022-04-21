const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      const newThread = new NewThread({
        title: 'Example Title',
        body: 'Example Body',
      });

      const credentialId = 'user-321';

      const fakeIdGenerator = () => '123'; // stub
      const fakeUserIdGenerator = () => '321'; // stub
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeUserIdGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);
      await threadRepositoryPostgres.addThread(newThread, credentialId);

      // Assert
      const users = await UsersTableTestHelper.findUsersById('user-321');
      expect(users).toHaveLength(1);
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding', // test
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      const newThread = new NewThread({
        title: 'Example Title',
        body: 'Example Body',
      });

      const credentialId = 'user-123';
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);
      const addedThread = await threadRepositoryPostgres.addThread(newThread, credentialId);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'Example Title',
        owner: credentialId,
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      expect(threadRepositoryPostgres.getThreadById('fakeId')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread\'s information when thread found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });

      // Action
      const result = await threadRepositoryPostgres.getThreadById('thread-123');
      expect(result.title).toEqual('Example Title');
      expect(result.body).toEqual('Example Body');
      expect(result.date).toEqual('test');
    });
  });
});
