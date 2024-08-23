RSpec.configure do |config|
  # Include all FactoryBot methods in RSpec without prepending the namespace.
  # Read more: https://github.com/thoughtbot/factory_bot/blob/main/GETTING_STARTED.md#rspec
  config.include FactoryBot::Syntax::Methods
end