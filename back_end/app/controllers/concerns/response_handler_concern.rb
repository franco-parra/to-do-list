module ResponseHandlerConcern
  extend ActiveSupport::Concern

  private

  def success_response(message:, data:)
    { status: "success", message: message, data: data }
  end

  def error_response(message:,  errors:)
    { status: "error", message: message, errors: errors }
  end
end