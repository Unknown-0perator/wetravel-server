exports.up = function (knex) {
    return knex.schema
        .createTable('plans', (table) => {
            table.uuid('plan_id').primary();
            table.uuid('user_id').reference('users.user_id').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.string('city').notNullable();
            table.string('start_date').notNullable();
            table.string('end_date').notNullable();
            table.string('country');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
}

exports.down = function (knex) {
    return knex.schema.dropTable('plans');
}