require "rails_helper"
require "devise/jwt/test_helpers"

RSpec.describe "User authentication", type: :request do
  let(:user_attributes) { attributes_for :user }
  
  describe "POST /users" do
    it "registers a user successfully" do
      expect {
        post user_registration_path, params: { user: user_attributes }
      }.to change(User, :count).by(1)
      expect(response).to have_http_status(:success)
    end
  end
  
  context "when a user already exists" do
    let!(:user) { create(:user, user_attributes) }
    let(:headers) { Devise::JWT::TestHelpers.auth_headers({}, user) }

    describe "POST /users/sign_in" do
      context "with correct credentials" do
        it "signs in successfully" do
          authenticate_user(user_attributes[:email], user_attributes[:password], :success)
        end
      end

      context "with incorrect credentials" do
        it "returns unauthorized status when credentials are incorrect" do
          authenticate_user(user_attributes[:email], user_attributes[:password] + "@", :unauthorized)
        end
      end
    end

    describe "DELETE /users/sign_out" do
      context "when a user is already signed in" do
        it "signs out the user succesfully" do
          delete destroy_user_session_path, headers: headers
          expect(response).to have_http_status(:success)
    
          get edit_user_registration_path, headers: headers
          expect(response).to have_http_status(:unauthorized)
        end
      end
    end
  end

  def authenticate_user(email, password, expected_http_status)
    post user_session_path, params: { user: { email: email, password: password } }
    expect(response).to have_http_status(expected_http_status)
  end
end