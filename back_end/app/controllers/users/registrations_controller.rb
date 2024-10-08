# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  include ResponseHandlerConcern
  # before_action :configure_sign_up_params, only: [:create]
  # before_action :configure_account_update_params, only: [:update]

  # GET /resource/sign_up
  # def new
  #   super
  # end

  # POST /resource
  def create
    build_resource(sign_up_params)

    resource.save
    yield resource if block_given?

    if resource.persisted?
      if resource.active_for_authentication?
        sign_up(resource_name, resource)
        render json: success_response(message: "User signed up successfully", data: { user: resource.as_json(except: [:jti]) }), status: :created
      else
        expire_data_after_sign_in!
        render json: success_response(message: "User signed up, but requires activation", data: { user: resource.as_json(except: [:jti]) }), status: :created
      end
    else
      clean_up_passwords resource
      set_minimum_password_length
      render json: error_response(message: "User creation failed", errors: resource.errors), status: :unprocessable_entity
    end
  end

  # GET /resource/edit
  # def edit
  #   super
  # end

  # PUT /resource
  def update
    self.resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)
    prev_unconfirmed_email = resource.unconfirmed_email if resource.respond_to?(:unconfirmed_email)

    resource_updated = update_resource(resource, account_update_params)
    yield resource if block_given?

    if resource_updated
      render json: success_response(message: "User updated successfully", data: { user: resource.as_json(except: [:jti]) })
    else
      clean_up_passwords resource
      set_minimum_password_length
      render json: error_response(message: "User update failed", errors: resource.errors), status: :unprocessable_entity
    end
  end

  # DELETE /resource
  def destroy
    resource.destroy
    Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name)
    yield resource if block_given?
    render json: success_response(message: "User deleted successfully", data: nil)
  end

  # GET /resource/cancel
  # Forces the session data which is usually expired after sign
  # in to be expired now. This is useful if the user wants to
  # cancel oauth signing in/up in the middle of the process,
  # removing all OAuth session data.
  # def cancel
  #   super
  # end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_up_params
  #   devise_parameter_sanitizer.permit(:sign_up, keys: [:attribute])
  # end

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_account_update_params
  #   devise_parameter_sanitizer.permit(:account_update, keys: [:attribute])
  # end

  # The path used after sign up.
  # def after_sign_up_path_for(resource)
  #   super(resource)
  # end

  # The path used after sign up for inactive accounts.
  # def after_inactive_sign_up_path_for(resource)
  #   super(resource)
  # end
end
