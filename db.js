const mongoose=require('mongoose');
const uri= process.env.URI || "mongodb://localhost:27017/inotes"
const connectMongo=()=>{
mongoose.connect(uri).then(()=>{console.log("connected")})
}
module.exports = connectMongo;