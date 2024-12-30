class Item < ApplicationRecord
  belongs_to :task
  validates :content, presence: true
  validates :completed, inclusion: { in: [ true, false ] }
end
