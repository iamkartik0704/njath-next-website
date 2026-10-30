import mongoose from "mongoose";

async function main() {
    await mongoose.connect("mongodb+srv://roostersalert_db_user:KdItblxmXkbfqfaO@cluster0.upy0ov3.mongodb.net/njath");
    const users = await mongoose.connection.collection("users").find({
        role: { $in: ["ADMIN", "ORGANIZER"] }
    }).project({ password: 0 }).toArray();
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

