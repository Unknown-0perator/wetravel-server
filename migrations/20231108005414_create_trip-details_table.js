exports.up = function (knex) {
    return knex.schema
        .createTable('trip_details', (table) => {
            table.uuid('event_id').primary();
            table.uuid('trip_id').references('trips.trip_id').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.string('date').notNullable();
            table.string('time').notNullable();
            table.string('event').notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
}

exports.down = function (knex) {
    return knex.schema.dropTable('trip_details');
}