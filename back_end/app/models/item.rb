class Item < ApplicationRecord
  belongs_to :task
  validates :content, :completed, presence: true
end
