require "rails_helper"
require "devise/jwt/test_helpers"

RSpec.describe "Item management", type: :request do
  let(:task) { create(:task) }
  let(:headers) { Devise::JWT::TestHelpers.auth_headers({}, task.user) }
  let(:parsed_response) { JSON.parse(response.body, symbolize_names: true) }

  before do
    Timecop.freeze(Date.today)
  end

  after do
    Timecop.return
  end

  describe "Creating a new item for a task" do
    context "with valid attributes" do
      it "creates the item successfully" do
        item_attributes = attributes_for :item, :completed
        expect {
          post task_items_path(task.id), params: { item: item_attributes }, headers: headers
        }.to change(Item, :count).by(1)
        expect(response).to have_http_status(:success)

        item = Item.find_by(id: parsed_response[:data][:item][:id])
        expect(item).not_to be_nil
        expect(item.content).to eq(item_attributes[:content])
        expect(item.completed).to eq(item_attributes[:completed])
      end
    end

    context "with invalid attributes" do
      it "fails to create the item and returns error messages" do
        item_attributes = attributes_for :item, :empty_content, :empty_completed
        post task_items_path(task.id), params: { item: item_attributes }, headers: headers
        expect(response).to have_http_status(:unprocessable_entity)
        expect(parsed_response[:errors][:content]).to include("can't be blank")
        expect(parsed_response[:errors][:content]).to include("can't be blank")
      end
    end
  end

  describe "When an item already exists" do
    let!(:item) { create(:item, :completed, task: task) }
    let(:item_attributes) { attributes_for :item, :completed }
    
    context "updating the item with valid attributes" do
      it "updates the item successfully" do
        put task_item_path(task.id, item.id), params: { item: item_attributes }, headers: headers
        expect(response).to have_http_status(:success)

        item.reload
        expect(item.content).to eq(item_attributes[:content])
        expect(item.completed).to eq(item_attributes[:completed])
      end
    end

    context "deleting the item" do
      it "deletes the item successfully" do
        expect {
          delete task_item_path(task.id, item.id), headers: headers
        }.to change(Item, :count).by(-1)
        expect(response).to have_http_status(:success)
      end
    end
  end
end
