"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const db_service_1 = require("./db.service");
let AllExceptionsFilter = class AllExceptionsFilter {
    catch(exception, host) {
        const res = host.switchToHttp().getResponse();
        let status = 500;
        let msg = '服务器内部错误';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const body = exception.getResponse();
            msg = typeof body === 'string' ? body : body.msg || body.message || '请求失败';
            if (Array.isArray(msg))
                msg = msg[0];
        }
        else if (exception && exception.message) {
            msg = exception.message;
        }
        res.status(status).json({ code: 1, msg });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalFilters(new AllExceptionsFilter());
    app.enableCors({ origin: true, credentials: true });
    app.setGlobalPrefix('api');
    // 挂载数据引用，供 Guard 使用
    app.getHttpAdapter().getInstance().locals = {
        db: app.get(db_service_1.DbService).data,
    };
    await app.listen(3000);
    console.log('[server] 微头条后端已启动: http://localhost:3000/api');
}
bootstrap();
