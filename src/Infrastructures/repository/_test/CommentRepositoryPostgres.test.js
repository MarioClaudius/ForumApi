const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persisted new comment', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'Example Content',
      });

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
      const threadId = 'thread-123';
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);
      await threadRepositoryPostgres.addThread(newThread, credentialId);
      await commentRepositoryPostgres.addComment(newComment, threadId, credentialId);

      const users = await UsersTableTestHelper.findUsersById('user-123');
      expect(users).toHaveLength(1);
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'Example Content',
      });

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
      const threadId = 'thread-123';
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);
      await threadRepositoryPostgres.addThread(newThread, credentialId);
      const addedComment = await commentRepositoryPostgres
        .addComment(newComment, threadId, credentialId);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: newComment.content,
        owner: 'user-123',
      }));
    });
  });

  describe('getCommentByIdAndThreadId function', () => {
    it('should throw NotFoundError when comment not found', () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      expect(commentRepositoryPostgres.getCommentByIdAndThreadId('fakeThreadId', 'fakeCommentId'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw any error and return commentId when comment found', async () => {
      // Arrange
      const userId = 'user-123';
      const thread_id = 'thread-123';
      const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
      });
      await ThreadsTableTestHelper.addThread({
        id: thread_id,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: thread_id,
      });

      // Action
      const id = await commentRepositoryPostgres.getCommentByIdAndThreadId(thread_id, commentId);

      // Assert
      expect(id).toEqual('comment-123');
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw Authorization Error when try to access unauthorized comment', async () => {
      // Arrange
      const userId = 'user-123';
      const thread_id = 'thread-123';
      const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
      });
      await ThreadsTableTestHelper.addThread({
        id: thread_id,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: thread_id,
      });

      // Action & Assert
      expect(commentRepositoryPostgres.verifyCommentOwner(commentId, 'fakeOwner'))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should not throw error when try to access authorized comment', async () => {
      // Arrange
      const userId = 'user-123';
      const thread_id = 'thread-123';
      const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
      });
      await ThreadsTableTestHelper.addThread({
        id: thread_id,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: thread_id,
      });

      // Action
      const id = await commentRepositoryPostgres.verifyCommentOwner(commentId, userId);

      // Assert
      expect(id).toEqual(commentId);
    });
  });

  describe('updateCommentIsDeleteStatusById function', () => {
    it('should update comment successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const thread_id = 'thread-123';
      const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
      });
      await ThreadsTableTestHelper.addThread({
        id: thread_id,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: thread_id,
      });

      // Action
      const id = await commentRepositoryPostgres.updateCommentIsDeleteStatusById(commentId);

      // Assert
      expect(id).toEqual(commentId);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return an array of comments', async () => {
      // Arrange
      const userId = 'user-123';
      const thread_id = 'thread-123';
      const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        id: userId,
        username: 'dicoding',
      });
      await ThreadsTableTestHelper.addThread({
        id: thread_id,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: thread_id,
      });

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(thread_id);

      // Assert
      expect(comments).toHaveLength(1);
    });
  });
});
