exports.up = function (knex) {
    return knex.schema
        .createTable('plan_details', (table) => {
            table.uuid('activity_id').primary();
            table.uuid('plan_id').reference('plans.plan_id').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.string('date').notNullable();
            table.string('time').notNullable();
            table.string('activity').notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
}

exports.down = function (knex) {
    return knex.schema.dropTable('plan_details');
}