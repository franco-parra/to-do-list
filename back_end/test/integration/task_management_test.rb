require "test_helper"
require "devise/jwt/test_helpers"

class TaskManagementTest < ActionDispatch::IntegrationTest
  include FactoryBot::Syntax::Methods

  setup do
    @user = create(:user)
    @headers = Devise::JWT::TestHelpers.auth_headers({}, @user)

    Timecop.freeze(Date.today) do
      @task_attributes = attributes_for :task
      post tasks_path, params: { task: @task_attributes }, headers: @headers
      assert_response :success

      @task = Task.find_by(id: JSON.parse(response.body, symbolize_names: true)[:data][:task][:id])
      assert_not_nil @task
    end
  end

  test "create task" do
    Timecop.freeze(Date.today) do
      assert_equal @task_attributes[:title], @task.title
      assert_equal @task_attributes[:description], @task.description
      assert_equal @task_attributes[:due_date], @task.due_date  
    end
  end

  test "create task with invalid attributes" do
    @task_attributes = attributes_for :task, :empty_title, :empty_description, :empty_due_date
    post tasks_path, params: { task: @task_attributes }, headers: @headers
    assert_response :unprocessable_entity

    error_response = JSON.parse(response.body)
    assert_includes error_response["errors"]["title"], "can't be blank"
    assert_includes error_response["errors"]["description"], "can't be blank"
    assert_includes error_response["errors"]["due_date"], "can't be blank"
  end

  test "update task" do
    Timecop.freeze(Date.today) do 
      @task_attributes = attributes_for :task
      put task_path(@task.id), params: { task: @task_attributes }, headers: @headers
      assert_response :success

      @task.reload
      assert_equal @task_attributes[:title], @task.title
      assert_equal @task_attributes[:description], @task.description
      assert_equal @task_attributes[:due_date], @task.due_date
    end
  end

  test "delete task" do
    assert_difference("Task.count", -1) do
      delete task_path(@task.id), headers: @headers
    end
  end
end
