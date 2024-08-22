# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  include ResponseHandlerConcern
  # before_action :configure_sign_in_params, only: [:create]

  # GET /resource/sign_in
  # def new
  #   super
  # end

  # POST /resource/sign_in
  def create
    self.resource = warden.authenticate(auth_options)

    if resource
      sign_in(resource_name, resource)
      yield resource if block_given?
      render json: success_response(message: "Signed in successfully", data: { user: resource.as_json(except: [:jti]) }), status: :ok
    else
      render json: error_response(message: "Failed to log in", errors: { base: "Invalid email or password" } ), status: :unauthorized
    end
  end

  # DELETE /resource/sign_out
  # def destroy
  #   super
  # end

  def respond_to_on_destroy
    render json: success_response(message: "Signed out successfully", data: nil), status: :ok
  end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
  # end
end
