import crypto from "node:crypto"
console.log("Crypto Module")

// built in node js modules system
// security related tasks 
// creating random UUID and ID's
// creating secure tokens 
// hashing data
// to verify if data waas changed or not 
// encrypt/decrypt

// crypto.randomUUID

const randomId = crypto.randomUUID()
console.log("Random UUID =>", randomId);

// crypto.randomByte

// password resest tokens
// email verifications
// session secret, api keys 

const secretKey = crypto.randomBytes(16)
const apiKey1 = crypto.randomBytes(16).toString('hex')
console.log("Secret key =>", secretKey);
console.log("API key =>", apiKey1);


// Hashing is a one way cryptograpic operation data can be hashed but hashed data can't be reversed
// --Data   =>   Hashed  This is Possible
// --Data   <=   Hashed  This is not Possible

// crypto.createHash

const data = "This is good string"
const hash = crypto.createHash('sha256').update(data).digest('hex')
console.log("Hashed Data =>", hash)

// crypto.createHmac
// in this we pass --data + secret => hash
// but in normal hash we just need data  -- data => hash

const secret = " this is a random data set "
const message = " this is a required message"
const hmacHashing = crypto.createHmac('sha256', secret).update(message).digest('hex')
console.log("HMAC:", hmacHashing);
