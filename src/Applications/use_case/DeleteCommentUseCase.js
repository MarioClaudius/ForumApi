class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(threadId, commentId, credentialId) {
    await this._commentRepository.getCommentByIdAndThreadId(threadId, commentId);
    await this._commentRepository.verifyCommentOwner(commentId, credentialId);
    await this._commentRepository.updateCommentIsDeleteStatusById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
