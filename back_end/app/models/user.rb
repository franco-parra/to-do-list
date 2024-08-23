class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  
  validates :name, presence: true
  has_many :tasks, dependent: :destroy
  
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  # 
  # Revocation strategies are a way to expire JWT tokens.
  # We use the JTIMatcher strategy. It adds a new string column named `jti`
  # to be added to the user. `jti` stands for JWT ID.
  # Read more: https://github.com/waiting-for-dev/devise-jwt?tab=readme-ov-file#jtimatcher
  devise :database_authenticatable, :registerable, :validatable, :jwt_authenticatable, jwt_revocation_strategy: self
end
