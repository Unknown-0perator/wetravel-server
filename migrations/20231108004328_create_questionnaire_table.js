exports.up = function (knex) {
    return knex.schema
        .createTable('questionnaire', (table) => {
            table.uuid('questionnaire_id').primary();
            table.uuid('user_id').references('users.user_id').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.string('country')
            table.string('traveler_type');
            table.string('food_type');
            table.string('food_rate');
            table.string('activity_type');
            table.string('climate_type');
            table.string('hobby_type');
            table.string('culture_rate');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
}

exports.down = function (knex) {
    return knex.schema.dropTable('questionnaire');
}