const request = require("supertest")
const app = require("../src/app.js")
const User = require("../src/models/user.js")
const {existingUserId, existingUser, nonExistentUser, setupDatabase} = require("./fixtures/db.js")

const getUserLoginDetails = user => ({email: user.email, password: user.password}) 

beforeEach(setupDatabase)

test('should signup a new user', async () => {
    const response = await request(app)                                   //example of advanced testing.. get response body that is being sent
                        .post('/users')
                        .send(nonExistentUser)
                        .expect(201)

    const user = await User.findById(response.body.user._id)                      //response.body is the response after request was successfully sent. same as what you'd receive in postman

    expect(user).not.toBeNull()                                             //should fail if there is no user with the id in the db

    //Test response being returned against user
    expect(response.body).toMatchObject({
        user: {
            name: nonExistentUser.name,
            email: nonExistentUser.email
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe(nonExistentUser.password)            //ensuring that password saved in db is hashed
})

test('should login existing user', async() => {
    const response = await request(app)
        .post('/users/login')
        .send(getUserLoginDetails(existingUser))
        .expect(200)

    const user = await User.findById(existingUserId)

    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        token: user.tokens[1].token
    })
})

test("should not login non existent user", async() => {
    await request(app)
        .post('/users/login')
        .send(getUserLoginDetails(nonExistentUser))
        .expect(400)
})

test("Should get profile for user", async () => {
    await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${existingUser.tokens[0].token}`) //adding jwt token to content header
        .send()
        .expect(200)
})

test("Should get unauthorized for user", async() => {
    await request(app)
        .get("/users/me")
        .send()
        .expect(401)
})

test("Should delete authorized user", async () => {
    await request(app)
        .delete("/users/me")
        .set("Authorization", `Bearer ${existingUser.tokens[0].token}`)
        .send()
        .expect(200)
})

test("Should not delete account for unauthenticated user", async () => {
    await request(app)
        .delete("/users/me")
        .send()
        .expect(401)
})

test("Should upload avatar", async () => {
    await request(app)
        .post("/users/me/avatar")
        .set("Authorization", `Bearer ${existingUser.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/portrait.jpg')
        .expect(200)

    const user = await User.findById(existingUserId)
    
    expect(user.avatar).toEqual(expect.any(Buffer))

})

test("Should update user details", async () => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${existingUser.tokens[0].token}`)
        .send({name: "Konko"})
        .expect(200)
    
    const user = await User.findById(existingUserId)

    expect(user.name).toBe("Konko")
})

test("Should not update invalid field", async () => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${existingUser.tokens[0].token}`)
        .send({location: "Okokomaiko"})       // there is no location field to be updated therefore i'm testing for bad request
        .expect(400)
    })