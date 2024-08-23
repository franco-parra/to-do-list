require "rails_helper"
require "devise/jwt/test_helpers"

RSpec.describe "User management", type: :request do
  let(:user_attributes) { attributes_for :user }

  describe "User registration and validation" do
    context "when creating a user with valid attributes" do
      it "creates the user successfully" do
        post user_registration_path, params: { user: user_attributes }
        expect(response).to have_http_status(:success)
  
        user = User.find_by(email: user_attributes[:email])
        expect(user).not_to be_nil
        expect(user.name).to eq(user_attributes[:name])
        expect(user.email).to eq(user_attributes[:email])
        expect(user.valid_password? user_attributes[:password]).to be true
      end
    end
    
    context "when creating a user with invalid attributes" do
      it "returns error for empty fields" do
        post user_registration_path, params: { user: attributes_for(:user, :empty_name, :empty_email, :empty_password) }
        expect(response).to have_http_status(:unprocessable_entity)

        error_response = JSON.parse(response.body, symbolize_names: true)
        expect(error_response[:errors][:name]).to include("can't be blank")
        expect(error_response[:errors][:name]).to include("can't be blank")
        expect(error_response[:errors][:email]).to include("can't be blank")
        expect(error_response[:errors][:password]).to include("can't be blank")
      end

      it "returns error for invalid email and short password" do
        post user_registration_path, params: { user: attributes_for(:user, :invalid_email, :invalid_password) }
        expect(response).to have_http_status(:unprocessable_entity)
    
        error_response = JSON.parse(response.body, symbolize_names: true)
        expect(error_response[:errors][:email]).to include("is invalid")
        expect(error_response[:errors][:password]).to include("is too short (minimum is 6 characters)")
      end
    end
  end

  describe "User management with authentication" do
    let(:user) { User.create(user_attributes) }
    let(:headers) { Devise::JWT::TestHelpers.auth_headers({}, user) }
    
    context "when updating a user" do
      it "updates the user successfully" do
        updated_attributes = attributes_for(:user).merge(current_password: user_attributes[:password])
        put user_registration_path, params: { user: updated_attributes }, headers: headers
        expect(response).to have_http_status(:success)

        user.reload
        expect(user.name).to eq(updated_attributes[:name])
        expect(user.email).to eq(updated_attributes[:email])
        expect(user.valid_password? updated_attributes[:password]).to be true
      end
    end
  end
end
