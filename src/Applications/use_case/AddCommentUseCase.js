const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, threadId, credentialId) {
    const newComment = new NewComment(useCasePayload);
    await this._threadRepository.getThreadById(threadId);
    return this._commentRepository.addComment(newComment, threadId, credentialId);
  }
}

module.exports = AddCommentUseCase;
