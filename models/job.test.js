"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/******************************create */

describe("create function", () => {
    let newJob = {
        title: "Test",
        salary: 1000,
        equity: "0.025",
        companyHandle: "c1"
    };

    test("create new job", async () => {
        let job = await Job.create(newJob);
        expect(job).toEqual({
            ...newJob,
            id: expect.any(Number),
        });
    });
});

/********************************findAll */

describe("findAll function", () => {
    test("find all: no filter", async () => {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: testJobIds[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyHandle: "c1",
                companyName: "C1"
            },
            {
                id: testJobIds[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1"
            },
            {
                id: testJobIds[2],
                title: "Job3",
                salary: 300,
                equity: "0",
                companyHandle: "c1",
                companyName: "C1"
            },
            {
                id: testJobIds[3],
                title: "Job4",
                salary: null,
                equity: null,
                companyHandle: "c1",
                companyName: "C1"
            },
        ]);
    });

    test("find all: filter by title", async () => {
        let jobs = await Job.findAll({ title: "Job1" });
        expect(jobs).toEqual([
            {
                id: testJobIds[0],
                title: "Job1",
                salary: 100,
                equity: "0.1", 
                companyHandle: "c1",
                companyName: "C1"
            }
        ])
    })

    test("find all: filter by minSalary", async () => {
        let jobs = await Job.findAll({ minSalary: 225 });
        expect(jobs).toEqual([
            {
                id: testJobIds[2],
                title: "Job3",
                salary: 300,
                equity: "0",
                companyHandle: "c1",
                companyName: "C1"
            }
        ]);
    });

    test("find all: filter by hasEquity", async () => {
        let jobs = await Job.findAll({ hasEquity: true });
        expect(jobs).toEqual([
            {
                id: testJobIds[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyHandle: "c1",
                companyName: "C1", 
            },
            {
                id: testJobIds[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
            }
        ]);
    });

    test("find all: filter by minSalary + hasEquity", async () => {
        let jobs = await Job.findAll({ minSalary: 175, hasEquity: true });
        expect(jobs).toEqual([
            {
                id: testJobIds[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
            }
        ])
    })
});

/*******************************get */

describe("get function", () => {
    test("get job by id", async () => {
        let job = await Job.get(testJobIds[0]);
        expect(job).toEqual({
            id: testJobIds[0],
            title: "Job1",
            salary: 100,
            equity: "0.1",
            company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img"
            }
        });
    });

    test("not found if no such job", async () => {
        try {
            await Job.get(999);
            fail();
        } catch(err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/****************************************update */

describe("update function", () => {
    let updateData = {
        title: "New Title",
        salary: 350,
        equity: "0.069"
    };

    test("update job in database", async () => {
        let job = await Job.update(testJobIds[0], updateData);
        expect(job).toEqual({
            id: testJobIds[0],
            companyHandle: "c1",
            ...updateData
        });
    });

    test("not found if no such job", async () => {
        try {
            await Job.update(999, {
                title: "Does Not Work"});
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async () => {
        try {
            await Job.update(testJobIds[0], {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("remove function", () => {
    test("remove job from database", async () => {
        await Job.remove(testJobIds[0]);
        const result = await db.query(
            `SELECT id
             FROM jobs
             WHERE id = $1`, [testJobIds[0]]
        );
        expect(result.rows.length).toEqual(0);
    });

    test("not found if no such job", async () => {
        try {
            await Job.remove(999);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});