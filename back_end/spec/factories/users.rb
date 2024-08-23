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

    trait :with_fixed_name do
      name { "Fixed Name" }
    end

    trait :with_fixed_email do
      email { "fixed_email@example.com" }
    end

    trait :with_fixed_password do
      password { "fixed_password" }
    end
  end
end