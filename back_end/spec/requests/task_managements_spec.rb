require "rails_helper"
require "devise/jwt/test_helpers"

RSpec.describe "Task management", type: :request do
  let(:user) { create(:user) }
  let(:headers) { Devise::JWT::TestHelpers.auth_headers({}, user) }
  let(:parsed_response) { JSON.parse(response.body, symbolize_names: true) }

  before do
    Timecop.freeze(Date.today)
  end

  after do
    Timecop.return
  end

  describe "POST /tasks" do
    context "with valid attributes" do
      it "creates the task successfully" do
        task_attributes = attributes_for :task
        expect {
          post tasks_path, params: { task: task_attributes }, headers: headers
        }.to change(Task, :count).by(1)

        task = Task.find_by(id: parsed_response[:data][:task][:id])
        expect(task).not_to be_nil
        expect(task.title).to eq(task_attributes[:title])
        expect(task.description).to eq(task_attributes[:description])
        expect(task.due_date).to eq(task_attributes[:due_date])
      end
    end

    context "with invalid attributes" do
      it "fails to create the task and return error messages" do
        expect {
          post tasks_path, params: { task: attributes_for(:task, :empty_title, :empty_description, :empty_due_date) }, headers: headers
        }.not_to change(Task, :count)
        expect(response).to have_http_status(:unprocessable_entity)
        expect(parsed_response[:errors][:title]).to include("can't be blank")
        expect(parsed_response[:errors][:description]).to include("can't be blank")
        expect(parsed_response[:errors][:due_date]).to include("can't be blank")
      end
    end
  end

  context "when a task already exists" do
    let!(:task) { create(:task, user: user) }
    let(:task_attributes) { attributes_for :task }
    
    describe "PUT /tasks/:id" do
      context "with valid attributes" do
        it "updates the task successfully" do
          put task_path(task.id), params: { task: task_attributes }, headers: headers
          expect(response).to have_http_status(:success)

          task.reload
          expect(task.title).to eq(task_attributes[:title])
          expect(task.description).to eq(task_attributes[:description])
          expect(task.due_date).to eq(task_attributes[:due_date])
        end
      end
    end

    describe "DELETE /tasks/:id" do
      it "deletes the task successfully" do
        expect {
          delete task_path(task.id), headers: headers
        }.to change(Task, :count).by(-1)
        expect(response).to have_http_status(:success)
      end
    end
  end
end
