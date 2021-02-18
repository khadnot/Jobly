"use strict";

const db = require("../db");
const { NotFoundError} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
    /** Create a job (from data), update db, return new job data.
     * 
     * data should be { title, salary, equity, companyHandle }
     * 
     * Returns { id, title, salary, equity, companyHandle }
    **/

    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs (title,
                               salary,
                               equity,
                               company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
             [ data.title,
               data.salary,
               data.equity,
               data.companyHandle
             ]);
        let job = result.rows[0];

        return job;
    }

    /** Find all jobs in the database
     * 
     * Returns [{ id, title, salary, equity, companyHandle },...]
    */

    static async findAll() {
        const result = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
             FROM jobs
             ORDER BY title`,
        );

        return result.rows;
    }

    /** Get job data based on id 
     * 
     * Returns { id, title, salary, equity, comanyHandle}
     * 
     * Throws NotFoundError if job not found.
    */

    static async get(id) {
        const jobRes = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
             FROM jobs
             WHERE id = $1`, [id]
        );

        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job found: ${id}`);

        const companiesRes = await db.query(
            `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
             FROM companies
             WHERE handle = $1`, [job.companyHandle]);

        delete job.companyHandle;
        job.company = companiesRes.rows[0];

        return job;
    }

    /** Update job data 
     * 
     * Data to update can include: { title, salary, equity } 
     * 
     * Returns { id, title, salary, equity, compnayHandle }
     * 
     * Throws NotFoundError if job not found
    */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {});
        const idVarIdx = "$" + (values.length + 1);

        const updateQuery = `UPDATE jobs
                             SET ${setCols}
                             WHERE id = ${idVarIdx}
                             RETURNING id,
                                       title,
                                       salary,
                                       equity,
                                       company_handle AS "companyHandle"`;
        const result = await db.query(updateQuery, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job found: ${id}`);

        return job;
    }

    /** Delete job from database
     * 
     * Returns undefined
     * 
     * Throws NotFoundError if job not found
     */

     static async remove(id) {
         const result = await db.query(
             `DELETE FROM jobs
              WHERE id = $1
              RETURNING id`, [id]
         );
         
         const job = result.rows[0];

         if (!job) throw new NotFoundError(`No job found: ${id}`);
     }
}

module.exports = Job;