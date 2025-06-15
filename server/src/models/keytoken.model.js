"use strict";
//
const { model, Schema, Types } = require("mongoose");
const DOCUMENT_NAME = "Key";
const COLLECTION_NAME = "Keys";

const keyTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    key: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = {
  Keytoken: model(DOCUMENT_NAME, keyTokenSchema),
};
