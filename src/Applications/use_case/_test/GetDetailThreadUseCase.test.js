const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const UserRepository = require('../../../Domains/users/UserRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('GetDetailThreadUseCase', () => {
  it('it should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const expectedDetailThread = {
      id: 'thread-123',
      title: 'Example title',
      body: 'Example body',
      date: 'Example date',
      username: 'Dicoding',
      comments: [],
    };
    const comment1 = new DetailComment({
      id: 'comment1',
      username: 'budi',
      date: 'example date',
      thread_id: 'thread-123',
      content: 'example content',
      isDeleted: false,
    });
    const comment2 = new DetailComment({
      id: 'comment2',
      username: 'bayu',
      date: 'date example',
      thread_id: 'thread-123',
      content: 'content example',
      isDeleted: false,
    });

    const commentsArray = [comment1, comment2];

    // creating dependency of use case
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // mock needed function
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(new DetailThread(expectedDetailThread)));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(commentsArray));

    // create use case instance
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const result = await getDetailThreadUseCase.execute(threadId);

    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(result).toEqual(new DetailThread({ ...expectedDetailThread, comments: commentsArray }));
  });
});
