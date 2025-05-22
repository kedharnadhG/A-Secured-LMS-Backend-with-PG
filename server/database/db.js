import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 5 seconds


class DatabaseConnection {
    constructor(){
        this.retryCount = 0;
        this.isConnected = false;


        //configure mongoose settings
        mongoose.set('strictQuery', true); // enable strict query mode, removes non-schema properties from queries/filters


        mongoose.connection.on('connected', () => {
            console.log('Connected to MongoDB successfully');
            this.isConnected = true;
        })

        mongoose.connection.on('disconnected', () => {
            console.log("Disconnected from MongoDB");
            //attempt to reconnect
            this.handleDisconnection();
        });

        mongoose.connection.on('error', (error) => {
            console.log("Error connecting to MongoDB:", error);
            this.isConnected = false;
        });

        //when appn fails, and db-hanging around it will be closed (terminating signal)
        /*  
        
        This is a constructor.

        And you're calling a method which is outside of the constructor.

        And it has no idea which object actually has called this particular method from the constructor.

        So it should pass on the context of it. (bind)
        
        */
        process.on("SIGTERM", this.handleAppTermination.bind(this));

    }

    async connect() {
        try {
            if(!process.env.MONGO_URI){
                throw new Error("MongoDB URI not found in environment variables");
            }
    
            //optional parameter for connection (connection options)
            const connectionOptions = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000, // 5 seconds
                socketTimeoutMS: 45000, // 45 seconds
                family: 4, // use IPv4 
            };
    
            if(process.env.NODE_ENV === "development"){
                mongoose.set('debug', true);
            }
    
            await mongoose.connect(process.env.MONGO_URI, connectionOptions);
            this.retryCount = 0;  // reset retry count on successful connection
    
        } catch (error) {
            console.error(error.message);
            await this.handleConnectionError();
        }

    }


    async handleConnectionError() {
        if(this.retryCount < MAX_RETRIES) {
            this.retryCount++;
            console.log(`Retrying connection to MongoDB (attempt ${this.retryCount} of ${MAX_RETRIES})`);
            
            await new Promise((resolve) => setTimeout(() => {
                resolve
            }, RETRY_INTERVAL));
            //after 5 seconds, trying to connect
            return this.connect();
        }else{
            console.error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts`);
            process.exit(1);
        }
    }

    async handleDisconnection() {
        if(!this.isConnected){
            console.log("Attempting to reconnect to MongoDB...");
            await this.connect();
        }
    }


    async handleAppTermination() {
        try {
            await mongoose.connection.close();
            console.log("MongoDB connection closed through app termination");
            process.exit(0);
        } catch (error) {
            console.log("Error during database disconnection:", error);
            process.exit(1);
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            name: mongoose.connection.name
        }
    }

}


//create a singleton instance
const dbConnection = new DatabaseConnection();
//we just want one-instance which makes 20- pool of connections (so that the same object does everything)
export default dbConnection.connect.bind(dbConnection); //if we won't bind the connection, it going to create a new connection every time
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection);