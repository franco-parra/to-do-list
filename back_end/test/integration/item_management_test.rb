require "test_helper"
require "devise/jwt/test_helpers"

class ItemManagementTest < ActionDispatch::IntegrationTest
  include FactoryBot::Syntax::Methods

  setup do
    @task = create(:task)
    @user = @task.user

    @headers = Devise::JWT::TestHelpers.auth_headers({}, @user)
    @item_attributes = attributes_for :item, :completed
    post task_items_path(@task.id), params: { item: @item_attributes }, headers: @headers
    assert_response :success

    @item = Item.find_by(id: JSON.parse(response.body, symbolize_names: true)[:data][:item][:id])
    assert_not_nil @item
  end

  test "create item with valid attributes" do
    assert_equal @item_attributes[:content], @item.content
    assert_equal @item_attributes[:completed], @item.completed
  end

  test "create item with invalid attributes" do
    @item_attributes = attributes_for :item, :empty_content, :empty_completed
    post task_items_path(@task.id), params: { item: @item_attributes }, headers: @headers
    assert_response :unprocessable_entity

    error_response = JSON.parse(response.body, symbolize_names: true)
    assert_includes error_response[:errors][:content], "can't be blank"
    assert_includes error_response[:errors][:completed], "can't be blank"
  end

  test "update item" do
    @item_attributes = attributes_for :item, :completed
    put task_item_path(@task.id, @item.id), params: { item: @item_attributes }, headers: @headers
    assert_response :success

    @item.reload
    assert_equal @item_attributes[:content], @item.content
    assert_equal @item_attributes[:completed], @item.completed
  end

  test "delete item" do
    assert_difference("Item.count", -1) do
      delete task_item_path(@task.id, @item.id), headers: @headers
    end
  end
end