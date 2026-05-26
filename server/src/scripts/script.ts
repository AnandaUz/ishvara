import "../../../_base/server/config.js";
import { connectDB } from "../../../_base/server/db.js";
import Guest from "../models/Guest.js";
// import { User } from '../models/User.js';
import mongoose from "mongoose";

/*
async function check() {
    try {
        await connectDB();
        const db = mongoose.connection.db;
        if (!db) throw new Error('DB is not connected');

        const collections = await db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));

        const user_v1_count = await db.collection('user_v1').countDocuments();
        console.log('Count in user_v1 (direct):', user_v1_count);

        const users_v1_count = await db.collection('users_v1').countDocuments();
        console.log('Count in users_v1 (direct):', users_v1_count);

        const users_count = await db.collection('users').countDocuments();
        console.log('Count in users (direct):', users_count);

        console.log('Using collection in model:', User.collection.name);
        const count = await User.countDocuments();
        console.log('User count in model collection:', count);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}
*/
async function updateGuestsProjectId() {
  try {
    await connectDB();
    const result = await Guest.updateMany(
      { projectId: { $exists: false } },
      { $set: { projectId: 100 } },
    );
    console.log(`Updated ${result.modifiedCount} guests without projectId`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}
// updateGuestsProjectId();
async function removeOpt() {
  try {
    await connectDB();
    const result = await Guest.updateMany(
      { $or: [{ ua: { $exists: true } }, { referrer: { $exists: true } }] },
      { $unset: { ua: "", referrer: "" } },
    );
    console.log(
      `Updated ${result.modifiedCount} guests without ua and referrer`,
    );
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}
// removeOpt();
async function tags() {
  try {
    await connectDB();
    // await Guest.updateMany(
    //     { "instagram.comp_name": 2 },
    //     { $set: { projectId: 10 } }
    // );

    // await Guest.collection.updateMany(
    //     { companyId: "meditations" },
    //     { $unset: { companyId: 2 } }
    // );

    // await Guest.collection.updateMany(
    //     { projectId: 10 },
    //     { $set: { companyId: 2 } }
    // );

    // await Guest.collection.updateMany(
    //     { projectId: 10 },
    //     { $set: { adsetId: 1 } }
    // );
    // await Guest.collection.updateMany(
    //     { projectId: 100, 'instagram.comp_name': { $exists: true } },
    //     { $set: { companyId: 1 } }
    // );
    const guests = await Guest.find({ level: 10 });

    for (const guest of guests) {
      if (!guest.tags || guest.tags.length === 0) continue;

      const filtered = guest.tags.filter((t: number) => t !== 10);
      if (filtered.length === 0) continue;

      const maxTag = Math.max(...filtered);
      await Guest.updateOne({ _id: guest._id }, { $set: { level: maxTag } });
    }
    // await Guest.collection.updateMany(
    //     { projectId: 100, 'instagram.comp_name': { $exists: true } },
    //     { $unset: { 'instagram.comp_name': "" } }
    // );
    // await Guest.collection.updateMany(
    //     { paramsString: { $exists: true } },
    //     { $unset: { paramsString: "" } }
    // );

    // const str = 1
    // await Guest.collection.updateMany(
    //     { projectId: 100, 'instagram.ad_name': str },
    //     { $set: { adId: 1 } }
    // );
    // await Guest.collection.updateMany(
    //     { projectId: 100, 'instagram.ad_name': str },
    //     { $unset: { 'instagram.ad_name': "" } }
    // );
    await Guest.collection.updateMany({ level: 10 }, { $unset: { level: "" } });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

tags();
