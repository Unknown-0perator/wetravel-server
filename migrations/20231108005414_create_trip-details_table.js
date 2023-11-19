exports.up = function (knex) {
    return knex.schema
        .createTable('trip_details', (table) => {
            table.uuid('event_id').primary();
            table.uuid('trip_id').references('trips.trip_id').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.string('date').notNullable();
            table.string('event_time').notNullable();
            table.string('event_type').notNullable();
            table.string('event_description').notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
}

exports.down = function (knex) {
    return knex.schema.dropTable('trip_details');
}