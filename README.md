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

```
------------------------------------------------------------------------------------------------------------------------

## 💳 Razorpay Payment Flow – Step-by-Step

🔐 Important Notes

| Step                 | Action                                |
| -------------------- | ------------------------------------- |
| Frontend -> Backend  | Initiates payment order               |
| Razorpay Checkout    | User enters payment details           |
| Razorpay -> Frontend | Sends success payload                 |
| Frontend -> Backend  | Sends data for verification           |
| Backend              | Validates using HMAC SHA256 signature |


---

### 1. 🛒 User Clicks "Buy Now"
User selects a product (e.g., a course) and clicks the "Buy Now" button.  
This triggers frontend logic to initiate the purchase flow.

---
### 2. 📡 Create Razorpay Order (Backend)
Frontend sends a request to your backend (e.g., `POST /api/payments/order`) with:
- `amount` (in paisa)
- `currency` (e.g. `"INR"`)
- metadata (course ID, user ID, etc.)

**Backend sample:**
```js
      import Razorpay from "razorpay";

      const razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      const createOrder = async (req, res) => {
        const options = {
          amount: 50000, // 500.00 INR in paisa
          currency: "INR",
          receipt: "order_rcptid_11",
        };

        const order = await razorpayInstance.orders.create(options);
        res.json({ success: true, order });
      };
   ```

3. 📦 Return Order Details to Frontend
    Your server responds with:
        order.id
        amount
        currency
    Frontend uses this data to initialize Razorpay checkout.

4. 💻 Frontend Opens Razorpay Checkout UI
Using Razorpay JS SDK, the frontend opens the payment modal:
```js
```js
import Razorpay from "razorpay";
      const options = {
        key: "RAZORPAY_KEY_ID",
        amount: order.amount,
        currency: "INR",
        name: "YourApp",
        description: "Course Purchase",
        order_id: order.id,
        handler: function (response) {
          // Trigger verification request to backend
          verifyPayment(response);
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#3399cc" },
      };

      const razorpay = new Razorpay(options);
      razorpay.open();
    ```
User completes the payment using UPI, card, net banking, etc.

5. ✅ Razorpay Returns Payment Details
On success, Razorpay calls the handler() function with:
    {
      razorpay_payment_id: "pay_29QQoUBi66xm2f",
      razorpay_order_id: "order_9A33XWu170gUtm",
      razorpay_signature: "generated_signature"
    }

6. 🔄 Frontend Sends Payment Details to Backend for Verification
      Send above data to backend POST /api/payments/verify.

7. 🧠 Backend Verifies Payment Signature
    Verifies authenticity of the transaction:

```js
    import crypto from "crypto";

    const verifyPayment = (req, res) => {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      const isValid = generatedSignature === razorpay_signature;

      if (isValid) {
        // Save payment in DB, enroll course, etc.
        res.json({ success: true, message: "Payment verified" });
      } else {
        res.status(400).json({ success: false, message: "Invalid signature" });
      }
    };
```

8. 🎉📡 Payment Confirmed 
    Once verified:
        Save payment details in DB.
        Enroll user in the course.
        Show a success message or redirect to confirmation page.

9. ❌ Payment Failed
      If payment fails (e.g., cancelled, insufficient balance):
          Show an error message or retry option
          Razorpay emits failure reasons in UI & callbacks
10. 💸 Payment Refunded (Optional)
    In case of refund:
        Update your database with refund info
        Notify the user accordingly

11. 🧠 Razorpay Documentation
    For more details, refer to the [Razorpay Docs Web_Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps#1-build-integration) and --- [Server Integration (Node)](https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/)

---
### 🔐 Razorpay Keys: Setup & Security
To integrate Razorpay, you'll need two keys:

RAZORPAY_KEY_ID – This is public-facing and can be used on the frontend (e.g., in Razorpay Checkout).

RAZORPAY_SECRET – This is private and must be kept secure. It should never be exposed on the frontend or version control.

###✅ Summary

| Key Type          | Used In            | Secure?           | Purpose                 |
| ----------------- | ------------------ | ----------------- | ----------------------- |
| `RAZORPAY_KEY_ID` | Frontend + Backend | ✅ Safe to expose  | Identify merchant (you) |
| `RAZORPAY_SECRET` | Backend only       | 🔐 Must be secret | Create & verify orders  |

**Note**: For security reasons, it's recommended to store these keys in environment variables or a secure configuration file.

---

### 🔎 Final Verification in Production (Best Practices)
Once Razorpay sends back the payment success response, and the signature is verified on your backend, you should do a double-check before marking the transaction as successful:

✅ Why Double-Check?
Even if the Razorpay signature is verified, you should reconfirm:
      The amount paid matches your intended amount.
      The order belongs to your system (not tampered).
      Status of payment is truly "captured" via Razorpay’s API.

### 🧠 Step-by-Step Final Verification
```js
import Razorpay from "razorpay";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const finalVerify = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // 1. Signature Verification (Basic Check)
  const crypto = require("crypto");
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  // 2. Fetch payment details from Razorpay
  const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

  // 3. Match payment amount with order
  if (payment.amount !== expectedAmount) {
    return res.status(400).json({ success: false, message: "Amount mismatch!" });
  }

  // 4. Confirm payment is captured
  if (payment.status !== "captured") {
    return res.status(400).json({ success: false, message: "Payment not captured yet!" });
  }

  // ✅ All good - Mark order as successful in DB
  res.json({ success: true, message: "Payment verified & amount matched", payment });
};
```

⚠️ Important Notes
    Use razorpayInstance.payments.fetch(payment_id) to get the full payment object.

    Always compare amount, currency, status, and order_id.

    Maintain logs in production for every verification step for traceability.