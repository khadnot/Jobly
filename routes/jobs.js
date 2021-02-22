"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = new express.Router();

/** POST / { job } => { job }
 * 
 * job should be { title, salary, equity, companyHandle }
 * 
 * Returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: admin
*/

router.post("/", ensureAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});

/** GET jobs
 * 
 * { jobs: [{ id, title, salary, equity, companyHandle, companyName }, ...]}
 * 
 * Authorization required: none
*/

router.get("/", async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, jobSearchSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const jobs = await Job.findAll(req.body);
        return res.status(201).json({ jobs });
    } catch (err) {
        return next(err);
    }
});

/** GET job by id
 * 
 * Returns { id, title, salary, equity, company }
 *      WHERE company IS { handle, name, description, numEmployees, logoUrl }
 * 
 * Authorization required: none
*/

router.get("/:id", async (req, res, next) => {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** PATCH - update job by id
 * 
 * Data to update can include: { title, salary, equity }
 * 
 * Returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: admin
*/

router.patch("/:id", ensureAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err)
    }
});

/** DELETE job by id
 * 
 * Returns { deleted: id }
 * 
 * Authorization required: admin
*/

router.delete("/:id", ensureAdmin, async (req, res, next) => {
    try {
        await Job.remove(req.params.id);
        return res.json({ deleted: +req.params.id });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;