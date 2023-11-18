exports.up = function (knex) {
    return knex.schema
        .createTable('trips', (table) => {
            table.uuid('trip_id').primary();
            table.uuid('user_id').references('users.user_id').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.string('destination').notNullable();
            table.string('start_date').notNullable();
            table.string('end_date').notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
}

exports.down = function (knex) {
    return knex.schema.dropTable('trips');
}