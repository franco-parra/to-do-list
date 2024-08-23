FactoryBot.define do
  factory :item do
    content { Faker::Lorem.sentence word_count: 16 }
    association :task

    trait :empty_content do
      content { nil }
    end

    trait :empty_completed do
      completed { nil }
    end
    
    trait :completed do
      completed { true }
    end

    trait :incompleted do
      completed { false }
    end
  end
end