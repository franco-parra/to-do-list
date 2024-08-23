module AuthenticationConcern
  extend ActiveSupport::Concern
  include ResponseHandlerConcern

  included do
    before_action :verify_user_logged_in
  end

  private

  def verify_user_logged_in
    unless user_signed_in?
      render json: error_response(message: "Access denied", errors: { base: "You need to sign in or sign up before continuing"}), status: :unauthorized
    end
  end
end