require "rails_helper"
require "devise/jwt/test_helpers"

RSpec.describe "User management", type: :request do
  let(:parsed_response) { JSON.parse(response.body, symbolize_names: true) }

  describe "POST /users" do
    context "with valid attributes" do
      let(:user_attributes) { attributes_for :user }

      it "creates the user successfully" do
        expect {
          post user_registration_path, params: { user: user_attributes }
        }.to change(User, :count).by(1)
        expect(response).to have_http_status(:success)
  
        user = User.find_by(email: user_attributes[:email])
        expect(user).not_to be_nil
        expect(user.name).to eq(user_attributes[:name])
        expect(user.email).to eq(user_attributes[:email])
        expect(user.valid_password? user_attributes[:password]).to be true
      end
    end
    
    context "with invalid attributes" do
      it "returns error for empty fields" do
        expect {
          post user_registration_path, params: { user: attributes_for(:user, :empty_name, :empty_email, :empty_password) }
        }.not_to change(User, :count)
        expect(response).to have_http_status(:unprocessable_entity)
        expect(parsed_response[:errors][:name]).to include("can't be blank")
        expect(parsed_response[:errors][:email]).to include("can't be blank")
        expect(parsed_response[:errors][:password]).to include("can't be blank")
      end

      it "returns error for invalid email and short password" do
        expect {
          post user_registration_path, params: { user: attributes_for(:user, :invalid_email, :invalid_password) }
        }.not_to change(User, :count)
        expect(response).to have_http_status(:unprocessable_entity)
        expect(parsed_response[:errors][:email]).to include("is invalid")
        expect(parsed_response[:errors][:password]).to include("is too short (minimum is 6 characters)")
      end
    end
  end

  context "when a user already exists" do
    let!(:user) { create(:user) }
    let(:headers) { Devise::JWT::TestHelpers.auth_headers({}, user) }
    
    describe "PUT /users" do
      context "with valid attributes" do
        let(:updated_attributes) { attributes_for(:user).merge(current_password: user.password) }
  
        it "updates the user successfully" do
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
end
