require "test_helper"

class UserManagementTest < ActionDispatch::IntegrationTest
  include FactoryBot::Syntax::Methods
  
  setup do
    @user_attributes = attributes_for :user
    post user_registration_path, params: { user: @user_attributes }
    assert_response :success

    @user = User.find_by(id: JSON.parse(response.body, symbolize_names: true)[:data][:user][:id])
    assert_not_nil @user
    
    @headers = { "Authorization": response.headers["Authorization"] }
  end

  test "create user with valid attributes" do
    assert_equal @user_attributes[:name], @user.name
    assert_equal @user_attributes[:email], @user.email
    assert @user.valid_password? @user_attributes[:password]
  end

  test "create user with invalid attributes" do
    post user_registration_path, params: { user: attributes_for(:user, :empty_name, :empty_email, :empty_password) }
    assert_response :unprocessable_entity

    error_response = JSON.parse(response.body)
    assert_includes error_response["errors"]["name"], "can't be blank"
    assert_includes error_response["errors"]["email"], "can't be blank"
    assert_includes error_response["errors"]["password"], "can't be blank"
    
    post user_registration_path, params: { user: attributes_for(:user, :invalid_email, :invalid_password) }
    assert_response :unprocessable_entity

    error_response = JSON.parse(response.body)
    assert_includes error_response["errors"]["email"], "is invalid"
    assert_includes error_response["errors"]["password"], "is too short (minimum is 6 characters)"
  end

  test "update user" do
    @user_attributes = attributes_for(:user).merge({ current_password: @user_attributes[:password] })
    put user_registration_path, params: { user: @user_attributes }, headers: @headers
    assert_response :success

    @user.reload
    assert_equal @user_attributes[:name], @user.name
    assert_equal @user_attributes[:email], @user.email
    assert @user.valid_password? @user_attributes[:password]
  end
end
