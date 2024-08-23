class Task < ApplicationRecord
  belongs_to :user
  has_many :items, dependent: :destroy
  validates :title, :description, :due_date, presence: true
end
