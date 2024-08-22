class ApplicationController < ActionController::API
  respond_to :json
  before_action :configure_devise_permitted_parameters, if: :devise_controller?

  def configure_devise_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name])
  end
end
