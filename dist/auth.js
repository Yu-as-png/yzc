"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = exports.tokenStore = void 0;
exports.issueToken = issueToken;
exports.uidFromToken = uidFromToken;
exports.optionalUser = optionalUser;
const common_1 = require("@nestjs/common");
/** 内存 token 表：token -> uid */
exports.tokenStore = new Map();
function issueToken(uid) {
    const token = 'tk_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    exports.tokenStore.set(token, uid);
    return token;
}
function uidFromToken(token) {
    if (!token)
        return null;
    const uid = exports.tokenStore.get(token);
    return uid === undefined ? null : uid;
}
/** 可选解析：从请求头解析当前用户（未登录返回 null） */
function optionalUser(req, users) {
    const auth = req.headers['authorization'] || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m)
        return null;
    const uid = uidFromToken(m[1].trim());
    if (uid == null)
        return null;
    return users.find((u) => u.id === uid) || null;
}
let AuthGuard = class AuthGuard {
    constructor(needAdmin = false) {
        this.needAdmin = needAdmin;
    }
    canActivate(ctx) {
        const req = ctx.switchToHttp().getRequest();
        const auth = req.headers['authorization'] || '';
        const m = auth.match(/^Bearer\s+(.+)$/i);
        const uid = m ? uidFromToken(m[1].trim()) : null;
        if (uid == null)
            throw new common_1.UnauthorizedException('未登录或 token 失效');
        const db = req.app.locals.db;
        const user = db.users.find((u) => u.id === uid);
        if (!user)
            throw new common_1.UnauthorizedException('用户不存在');
        req.user = user;
        if (this.needAdmin && user.role !== 1)
            throw new common_1.ForbiddenException('需要管理员权限');
        return true;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Boolean])
], AuthGuard);
