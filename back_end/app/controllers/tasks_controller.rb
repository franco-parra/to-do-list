class TasksController < ApplicationController
  include AuthenticationConcern
  include ResponseHandlerConcern

  before_action :set_task, only: [ :show, :update, :destroy ]

  def index
    authorize! :read, Task
    render json: success_response(message: "Resources retrieved successfully", data: { tasks: current_user.tasks.includes(:items).as_json(include: :items) }), status: :ok
  end

  def show
    authorize! :read, @task
    render json: success_response(message: "Resource retrieved succesfully", data: { task: @task }), status: :ok
  end

  def create
    task = current_user.tasks.new(task_params)
    authorize! :create, task

    if task.save
      render json: success_response(message: "Resource created successfully", data: { task: task }), status: :created
    else
      render json: error_response(message: "Failed to create resource", errors: task.errors), status: :unprocessable_entity
    end
  end

  def update
    authorize! :update, @task

    if @task.update(task_params)
      render json: success_response(message: "Resource updated successfully", data: { task: @task }), status: :ok
    else
      render json: error_response(message: "Failed to update resource", errors: @task.errors), status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @task

    begin
      @task.destroy!
      render json: success_response(message: "Resource deleted successfully", data: nil), status: :ok
    rescue StandardError => error
      render json: error_response(message: "An unexpected error ocurred", errors: { base: error.message }), status: :internal_server_error
    end
  end

  private

  def task_params
    params.require(:task).permit(:title, :description, :due_date)
  end

  def set_task
    @task = current_user.tasks.find(params[:id])
  end
end
