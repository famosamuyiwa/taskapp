const request = require("supertest")
const app = require("../src/app.js")
const Task = require("../src/models/task.js")

const {existingUserId, existingUser, existingUser2, nonExistentUser, task, setupDatabase} = require("./fixtures/db.js")

beforeEach(setupDatabase)


test("Should create task for user", async () => {
    const response = await request(app)
                        .post("/tasks")
                        .set("Authorization", `Bearer ${existingUser.tokens[0].token}`)
                        .send({
                            description: "First task test"
                        })
                        .expect(201)
    
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)          //should be false by default
})

test("Should check user tasks", async () =>{
    const response = await request(app)
                        .get("/tasks")
                        .set("Authorization", `Bearer ${existingUser.tokens[0].token}`)
                        .send()
                        .expect(200)

    expect(response.body.length).toBe(2)
})

test("Should not delete another user's task", async () => {
    await request(app)
            .delete(`/tasks/${task._id}`)
            .set("Authorization", `Bearer ${existingUser2.tokens[0].token}`)
            .send()
            .expect(404)
    
    const t = await Task.findById(task._id)
    expect(t).not.toBeNull()
})