class ItemsController < ApplicationController
  include AuthenticationConcern
  include ResponseHandlerConcern
  
  before_action :set_task, only: [:create, :destroy, :update]
  before_action :set_item, only: [:destroy, :update]

  def create
    item = @task.items.new(item_params)
    authorize! :create, item

    if item.save
      render json: success_response(message: "Resource created succesfully", data: { item: item }), status: :created
    else
      render json: error_response(message: "Failed to create resource", errors: item.errors ), status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @item

    begin
      @item.destroy!
      render json: success_response(message: "Resource deleted successfully", data: nil), status: :ok
    rescue StandardError => error
      render json: error_response(message: "An unexpected error ocurred", errors: { base: error.message }), status: :internal_server_error
    end
  end

  def update
    authorize! :update, @item
    
    if @item.update(item_params)
      render json: success_response(message: "Resource updated successfully", data: { item: @item }), status: :ok
    else
      render json: error_response(message: "Failed to update resource", errors: @item.errors), status: :unprocessable_entity
    end
  end

  private

  def item_params
    params.require(:item).permit(:content, :completed)
  end

  def set_task
    @task = current_user.tasks.find(params[:task_id])
  end

  def set_item
    @item = @task.items.find(params[:id])
  end
end
