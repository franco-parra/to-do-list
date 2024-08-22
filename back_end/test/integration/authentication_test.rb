require "test_helper"

class AuthenticationTest < ActionDispatch::IntegrationTest
  # If we don't include this method, then all `factory2_bot` will need
  # to be prefaced with `FactoryBot`.
  # Read more: https://github.com/thoughtbot/factory_bot/blob/main/GETTING_STARTED.md#minitest-rails
  include FactoryBot::Syntax::Methods
  
  setup do
    @user_attributes = attributes_for :user
    post user_registration_path, params: { user: @user_attributes }  
    assert_response :success

    @user = User.find_by(email: @user_attributes[:email])
    assert_not_nil @user

    @headers = { "Authorization": response.headers["Authorization"] }
  end

  test "sign out user" do
    delete destroy_user_session_path, headers: @headers 
    assert_response :success
    
    @headers = { "Authorization": response.headers["Authorization"] }

    get edit_user_registration_path, headers: @headers
    assert_response :unauthorized
  end

  test "delete user and fail to sign in again with the same JWT" do
    assert_difference("User.count", -1) do
      delete user_registration_path, headers: @headers
    end

    post user_session_path, params: { user: @user_attributes }
    assert_response :unauthorized
  end

  test "sign in with correct credentials" do
    delete destroy_user_session_path, headers: @headers
    assert_response :success

    post user_session_path, params: { user: @user_attributes }
    assert_response :success
  end

  test "sign in with incorrect credentials" do
    delete destroy_user_session_path, headers: @headers
    assert_response :success

    @user_attributes[:password] = @user_attributes[:password] + "@"
    post user_session_path, params: { user: @user_attributes }
    assert_response :unauthorized
  end
end
