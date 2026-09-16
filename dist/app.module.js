"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const db_service_1 = require("./db.service");
const controllers_1 = require("./controllers");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            controllers_1.AppController,
            controllers_1.AuthController,
            controllers_1.UsersController,
            controllers_1.HeadlinesController,
            controllers_1.CommentsController,
            controllers_1.TypesController,
            controllers_1.NoticesController,
            controllers_1.AdminController,
            controllers_1.StatsController,
        ],
        providers: [db_service_1.DbService],
    })
], AppModule);
