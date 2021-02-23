"use strict";

const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
    u1Token,
    adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", () => {
    test("works for admin: create new job", async () => {
        const resp = await request(app)
            .post(`/jobs`)
            .send({
                companyHandle: "c1",
                title: "New Job",
                salary: 350,
                equity: "0.025"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "New Job",
                salary: 350,
                equity: "0.025",
                companyHandle: "c1"
            }
        });
    });

    test("unauthorized for non-admins", async () => {
        const resp = await request(app)
            .post(`/jobs`)
            .send({
                companyHandle: "c1",
                title: "New Job",
                salary: 360,
                equity: "0.069",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("bad request with missing data", async () => {
        const resp = await request(app)
            .post(`/jobs`)
            .send({
                companyHandle: "c1",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async () => {
        const resp = await request(app)
            .post(`/jobs`)
            .send({
            companyHandle: "c1",
            title: "New Job",
            salary: "not-a-number",
            equity: "0.025",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/******************************************* GET /jobs */

describe("GET /jobs", () => {
  test("works for all", async () => {
    const resp = await request(app).get(`/jobs`)
    expect(resp.body).toEqual({
        jobs: [
            {
              id: expect.any(Number),
              title: "Job1",
              salary: 100,
              equity: "0.010",
              companyHandle: "c1"
            },
            {
              id: expect.any(Number),
              title: "Job2",
              salary: 200,
              equity: "0.020",
              companyHandle: "c1"
            },
            {
              id: expect.any(Number),
              title: "Job3",
              salary: 300,
              equity: null,
              companyHandle: "c1"
            }
        ]
    });
  });
});

/********************************************* GET /jobs/:id */

describe("GET /jobs/:id", () => {
  test("works for all", async () => {
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
        job: {
            id: testJobIds[0],
            title: "Job1",
            salary: 100,
            equity: "0.010",
            company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            }
        }
    });
  });

  test("not found for no such job", async () => {
      const resp = await request(app).get(`/jobs/999`);
      expect(resp.statusCode).toEqual(404);
  });
});

/*************************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", () => {
  test("works for admin: update job", async () => {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
            title: "New Job",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
          id: expect.any(Number),
          title: "New Job",
          salary: 100,
          equity: "0.010",
          companyHandle: "c1"
      }
    });
  });

  test("unauthorized for non-admin", async () => {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
            title: "New Job"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async () => {
    const resp = await request(app)
        .patch(`/jobs/999`)
        .send({
            handle: "new"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async () => {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
            salary: "not-a-number",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/*********************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", () => {
  test("works for admin: delete job", async () => {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: testJobIds[0] });
  });

  test("unauthorized for non-admin", async () => {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for non-user", async () => {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async () => {
    const resp = await request(app)
        .delete(`/jobs/999`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});