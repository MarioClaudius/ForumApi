const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating delete comment action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const credentialId = 'user-123';

    // creating dependency of use case
    const mockCommentRepository = new CommentRepository();

    // mock needed function
    mockCommentRepository.getCommentByIdAndThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.updateCommentIsDeleteStatusById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // creating use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(threadId, commentId, credentialId);

    // Assert
    expect(mockCommentRepository.getCommentByIdAndThreadId).toBeCalledWith(threadId, commentId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(commentId, credentialId);
    expect(mockCommentRepository.updateCommentIsDeleteStatusById).toBeCalledWith(commentId);
  });
});
