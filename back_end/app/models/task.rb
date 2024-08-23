class Task < ApplicationRecord
  belongs_to :user
  validates :title, :description, :due_date, presence: true
end
