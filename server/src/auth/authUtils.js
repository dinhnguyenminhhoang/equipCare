"use strict";
const JWT = require("jsonwebtoken");
const { asynchandler } = require("../helpers/asynchandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};

const createTokenPair = async (payload, key) => {
  try {
    const accessToken = await JWT.sign(payload, key, {
      expiresIn: "5 days",
    });
    return { accessToken };
  } catch (error) {
    throw new Error("Error creating token pair");
  }
};

const authentication = asynchandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid request");

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("KeyStore not found");
  const authHeader = req.headers[HEADER.AUTHORIZATION];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthFailureError(
      "Invalid request: Missing or malformed Authorization header"
    );
  }
  const accessToken = authHeader.split(" ")[1];

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.key);
    if (userId != decodeUser.userId) {
      throw new AuthFailureError("Invalid user");
    }
    req.user = decodeUser;
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw new AuthFailureError("Unauthorized access");
  }
});
const adminAuthentication = asynchandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid request");

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("KeyStore not found");
  const authHeader = req.headers[HEADER.AUTHORIZATION];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthFailureError(
      "Invalid request: Missing or malformed Authorization header"
    );
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.key);
    if (userId != decodeUser.userId) {
      throw new AuthFailureError("Invalid user");
    }
    const a = [];
    a.includes;
    if (!decodeUser.role?.includes("ADMIN")) {
      throw new NotFoundError("Not found");
    }
    req.user = decodeUser;
    return next();
  } catch (error) {
    throw new AuthFailureError("Unauthorized access");
  }
});
const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  verifyJWT,
  authentication,
  adminAuthentication,
};
