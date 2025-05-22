#####       Express Application Server Index-file  structure   #####


// 1. Imports
// 2. dotenv Config
// 3. create express app & also get port from env
// 4. Rate Limiting Definition
// 5. Security Middlewares (helmet, mongoSanitize, hpp, )
// 6. use Rate Limiting for APIs starts with (/api)
// 7. use cookie parser
// 8. use cors

// 9. use morgan logger for dev-env

// 10. Body Parser Middlewares (json, urlencoded)

// 11. Global Error Handler

// 12. CORS Configuration

// 13. API Routes

// 14. handle 404

// 15. app.listen

------------------------------------------------------------------------------------------------------------------------

## 🧩 Robust MongoDB Connection Handling

This project includes a **resilient singleton class** that wraps Mongoose connection logic to ensure **graceful startup, auto-recovery, and clean shutdown**.

### 🧠 What is a Resilient Singleton?
A **resilient singleton** is a pattern that ensures a single instance of a class is created and accessed globally, even if the application is restarted or scaled.

### 🎯 Key Features we are handling

✅ Handling missing Mongo URI, initial connection failures with retry logic, disconnect events, and runtime DB errors.
🧹 Also manages graceful shutdown on SIGTERM and exposes a utility to monitor live connection status.


## ⚡ MongoDB Connection Pooling with Mongoose

Mongoose uses MongoDB's **connection pooling** by default to ensure efficient, high-performance communication with the database.

### 🧠 What is Connection Pooling?
Instead of opening a new connection for every request, a **pool of reusable connections** is maintained — reducing latency and improving throughput in production environments.

### ⚙️ Default Behavior
- `mongoose.connect()` creates a connection pool **automatically**.
- Default `maxPoolSize` is **5**.
- Mongoose handles reconnections and queuing internally.

### 🔧 Customizing Pool Options
You can configure pool size and timeouts like so:



### ✅ Key Features

- 🔁 **Retry logic**: Retries DB connection up to 3 times on failure.
- 🔄 **Auto-reconnect**: Reconnects on disconnection events.
- 🧹 **Graceful shutdown**: Closes connection on `SIGTERM`.
- 🧪 **Status utility**: Get live connection info using `getConnectionStatus()`.



### 📦 MODELS

#### 📄 File Naming Convention
- If it has only one model → `course.model.js` *(singular because one course is inserted at a time)*
- If it has more than one model → `course.js`

#### 🔐 Password Handling (Hashing, not Encryption)
- Passwords are stored using **hashing algorithms**, not encryption — hashing is irreversible and secure.
- During login, the entered password is **hashed again** and compared with the stored hash to validate the user.




-----------------------------------------------------------------------------------------------------------------------


#### 🧮 Virtuals in Mongoose

Virtuals are **schema-level fields that do not get persisted in the database**, but are **computed dynamically** based on existing model data.

🔍 Example Use-Case:
To calculate a user's total enrolled courses, you don't need to store the count — just use a virtual field that returns `this.enrolledCourses.length`.

```js
UserSchema.virtual("totalEnrolledCourses").get(function () {
  return this.enrolledCourses.length;
});
✅ Benefits:

No redundant data storage.

Lightweight and performant.

Great for computed values like counts, full names, formatted dates, etc.

🧠 Note: Virtuals are only included in output if you explicitly enable them using .toObject({ virtuals: true }) or .toJSON({ virtuals: true }).

#### 🔄 Enabling Virtuals in Output

By default, Mongoose virtuals are not included when converting documents to JSON or plain objects. To include them, you must explicitly enable them using:

🧠 When to use what:

toJSON: Used when returning responses via APIs (e.g., res.json()).

toObject: Used internally or when you manually convert a document to a plain JavaScript object (e.g., for transformations or manipulation).