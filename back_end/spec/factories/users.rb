FactoryBot.define do
  factory :user do
    name { Faker::Name.unique.name }
    email { Faker::Internet.unique.email }
    password { Faker::Internet.password }

    trait :empty_name do
      name { "" }
    end

    trait :empty_password do
      password { "" }
    end

    trait :empty_email do
      email { "" }
    end

    trait :invalid_email do
      email { Faker::Name.name }
    end

    trait :invalid_password do
      password { "x" }
    end
  end
end