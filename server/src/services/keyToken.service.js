"use strict";
const { Types } = require("mongoose");
const { Keytoken } = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, key }) => {
    try {
      const fill = { user: userId },
        update = {
          key,
        },
        options = { upsert: true, new: true };
      const tokens = await Keytoken.findOneAndUpdate(fill, update, options);
      return tokens ? tokens.key : null;
    } catch (error) {
      return error;
    }
  };
  static removeKeyById = async (id) => {
    return await Keytoken.deleteOne(id);
  };
  static findByUserId = async (userId) => {
    return await Keytoken.findOne({ user: new Types.ObjectId(userId) }).lean();
  };

  static deleteKeyById = async (userId) => {
    return await Keytoken.deleteOne({
      user: new Types.ObjectId(userId),
    }).lean();
  };
}
module.exports = KeyTokenService;
