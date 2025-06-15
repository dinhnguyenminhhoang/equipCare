"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  login = async (req, res, next) => {
    new SuccessResponse({
      data: await AccessService.login(req.body),
    }).send(res);
  };
  singUp = async (req, res, next) => {
    new CREATED({
      message: "Register OK!",
      data: await AccessService.singUp(req.body),
    }).send(res);
  };
  forgotPassword = async (req, res, next) => {
    new SuccessResponse({
      message: "OK!",
      data: await AccessService.forgotPassword(req.body),
    }).send(res);
  };
  confirmAccount = async (req, res, next) => {
    new SuccessResponse({
      message: "OK!",
      data: await AccessService.confirmAccount(req.user, req.keyStore),
    }).send(res);
  };
  resetPassword = async (req, res, next) => {
    new SuccessResponse({
      message: "OK!",
      data: await AccessService.resetPassword(req.body, req.user, req.keyStore),
    }).send(res);
  };
  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "logout successfully",
      data: await AccessService.Logout({ keyStore: req.keyStore }),
    }).send(res);
  };
}
module.exports = new AccessController();
