require "test_helper"

class AuthenticationTest < ActionDispatch::IntegrationTest
  # If we don't include this method, then all `factory_bot` will need
  # to be prefaced with `FactoryBot`.
  # Read more: https://github.com/thoughtbot/factory_bot/blob/main/GETTING_STARTED.md#minitest-rails
  include FactoryBot::Syntax::Methods
  
  setup do
    @user_attributes = attributes_for :user
    register_user
    authenticate_user(:success)
  end

  test "sign out user" do
    sign_out_user
    
    get edit_user_registration_path, headers: @headers
    assert_response :unauthorized
  end

  test "delete user and fail to sign in again with the same JWT" do
    assert_difference("User.count", -1) do
      delete user_registration_path, headers: @headers
    end

    authenticate_user(:unauthorized)
  end

  test "sign in with correct credentials" do
    sign_out_user
    authenticate_user(:success)
  end

  test "sign in with incorrect credentials" do
    sign_out_user
    @user_attributes[:password] += "@"

    authenticate_user(:unauthorized)
  end

  private

  def register_user
    post user_registration_path, params: { user: @user_attributes }  
    assert_response :success

    @user = User.find_by(email: @user_attributes[:email])
    assert_not_nil @user
  end

  def authenticate_user(expected_response)
    post user_session_path, params: { user: @user_attributes }
    assert_response expected_response
    @headers = { "Authorization": response.headers["Authorization"] } if expected_response == :success
  end

  def sign_out_user
    delete destroy_user_session_path, headers: @headers
    assert_response :success
  end
end
