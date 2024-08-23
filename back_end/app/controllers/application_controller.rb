class ApplicationController < ActionController::API
  include ResponseHandlerConcern

  respond_to :json
  before_action :configure_devise_permitted_parameters, if: :devise_controller?
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
  rescue_from ActiveRecord::RecordNotDestroyed, with: :record_not_destroyed

  def record_not_found
    render json: error_response(message: "Record not found", errors: nil), status: :not_found
  end

  def record_not_destroyed
    render json: error_response(message: "Record not destroyed", errors: nil), status: :unprocessable_entity
  end

  def configure_devise_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name])
  end
end
