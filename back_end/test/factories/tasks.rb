FactoryBot.define do
  factory :task do
    title { Faker::Lorem.sentence word_count: 4 }
    description { Faker::Lorem.sentence word_count: 8 }
    due_date { 1.week.from_now.utc }
    association :user

    trait :empty_title do
      title { "" }
    end

    trait :empty_description do
      description { "" }
    end

    trait :empty_due_date do
      due_date { "" }
    end
  end
end