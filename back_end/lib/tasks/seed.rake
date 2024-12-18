namespace :db do
  desc "Seed database"
  task seed: :environment do
    user = User.create(name: "Franco", email: "franco@gmail.com", password: "123456")
    5.times do
      task = user.tasks.create(title: Faker::Lorem.sentence(word_count: 4), description: Faker::Lorem.sentence(word_count: 8), due_date: 1.week.from_now.utc)
      3.times do
        task.items.create(content: Faker::Lorem.sentence(word_count: 16), completed: [ true, false ].sample)
      end
    end
    puts "Seed completed"
  end

  desc "Unseed database"
  task unseed: :environment do
    User.destroy_all
    puts "Unseed completed"
  end
end
