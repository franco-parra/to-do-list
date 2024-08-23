require "rails_helper"
require "devise/jwt/test_helpers"

RSpec.describe "User authentication", type: :request do
  let(:user_attributes) { attributes_for :user, :with_fixed_name, :with_fixed_email, :with_fixed_password }
  let!(:user) { create(:user, user_attributes) }
  let(:headers) { Devise::JWT::TestHelpers.auth_headers({}, user) }

  describe "User registration" do
    it "registers a user successfully" do
      post user_registration_path, params: { user: attributes_for(:user) }
      expect(response).to have_http_status(:success)
    end
  end

  describe "User sign in" do
    context "with correct credentials" do
      it "signs in successfully" do
        authenticate_user(user_attributes[:email], user_attributes[:password], :success)
      end
    end

    context "with incorrect credentials" do
      it "fails to sign in" do
        authenticate_user(user_attributes[:email], user_attributes[:password] + "@", :unauthorized)
      end
    end
  end

  describe "User sign out" do
    it "signs out the user successfully" do
      delete destroy_user_session_path, headers: headers
      expect(response).to have_http_status(:success)

      get edit_user_registration_path, headers: headers
      expect(response).to have_http_status(:unauthorized)
    end
  end

  def authenticate_user(email, password, expected_http_status)
    post user_session_path, params: { user: { email: email, password: password } }
    expect(response).to have_http_status(expected_http_status)
  end
end