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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = exports.NoticesController = exports.AdminController = exports.CommentsController = exports.HeadlinesController = exports.TypesController = exports.UsersController = exports.AuthController = exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const db_service_1 = require("./db.service");
const auth_1 = require("./auth");
const ok = (data = null) => ({ code: 0, data });
const fail = (msg) => new common_1.HttpException({ code: 1, msg }, 400);
const adminGuard = new auth_1.AuthGuard(true);
const authGuard = new auth_1.AuthGuard(false);
let AppController = class AppController {
    root() {
        return ok({ name: '微头条 API', status: 'running' });
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "root", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
let AuthController = class AuthController {
    constructor(db) {
        this.db = db;
    }
    register(b) {
        const { username, password, confirm, nickname } = b || {};
        if (!username || !password || !confirm || !nickname)
            throw fail('请填写完整信息');
        if (password !== confirm)
            throw fail('两次密码不一致');
        if (this.db.data.users.some((u) => u.username === username))
            throw fail('用户名已存在');
        const user = {
            id: this.db.nextId('users'),
            username,
            password,
            nickname,
            role: 0,
            create_time: this.db.now(),
        };
        this.db.data.users.push(user);
        this.db.save();
        return ok({ id: user.id, username, nickname, role: 0 });
    }
    login(b) {
        const { username, password } = b || {};
        const user = this.db.data.users.find((u) => u.username === username && u.password === password);
        if (!user)
            throw fail('用户名或密码错误');
        const token = (0, auth_1.issueToken)(user.id);
        return ok({ token, user: { id: user.id, username: user.username, nickname: user.nickname, role: user.role } });
    }
    profile(req) {
        const u = req.user;
        return ok({ id: u.id, username: u.username, nickname: u.nickname, role: u.role, create_time: u.create_time });
    }
    changePassword(req, b) {
        const { oldPassword, newPassword, confirm } = b || {};
        if (!oldPassword || !newPassword || !confirm)
            throw fail('请填写完整');
        if (req.user.password !== oldPassword)
            throw fail('旧密码错误');
        if (newPassword !== confirm)
            throw fail('两次新密码不一致');
        req.user.password = newPassword;
        this.db.save();
        return ok();
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(authGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "profile", null);
__decorate([
    (0, common_1.Put)('password'),
    (0, common_1.UseGuards)(authGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changePassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [db_service_1.DbService])
], AuthController);
let UsersController = class UsersController {
    constructor(db) {
        this.db = db;
    }
    list() {
        return ok(this.db.data.users.map((u) => ({
            id: u.id,
            username: u.username,
            nickname: u.nickname,
            role: u.role,
            create_time: u.create_time,
        })));
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(adminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "list", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [db_service_1.DbService])
], UsersController);
let TypesController = class TypesController {
    constructor(db) {
        this.db = db;
    }
    list() {
        return ok(this.db.data.types);
    }
    create(b) {
        const name = (b && b.name || '').trim();
        if (!name)
            throw fail('类型名不能为空');
        if (this.db.data.types.some((t) => t.name === name))
            throw fail('类型已存在');
        const t = { id: this.db.nextId('types'), name };
        this.db.data.types.push(t);
        this.db.save();
        return ok(t);
    }
    update(id, b) {
        const t = this.db.data.types.find((x) => x.id === id);
        if (!t)
            throw fail('类型不存在');
        const name = (b && b.name || '').trim();
        if (!name)
            throw fail('类型名不能为空');
        t.name = name;
        this.db.save();
        return ok(t);
    }
    remove(id) {
        const t = this.db.data.types.find((x) => x.id === id);
        if (!t)
            throw fail('类型不存在');
        if (this.db.data.headlines.some((h) => h.typeId === id)) {
            throw fail('该类型下存在关联头条，无法删除');
        }
        this.db.data.types = this.db.data.types.filter((x) => x.id !== id);
        this.db.save();
        return ok();
    }
};
exports.TypesController = TypesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TypesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(adminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TypesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(adminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TypesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(adminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TypesController.prototype, "remove", null);
exports.TypesController = TypesController = __decorate([
    (0, common_1.Controller)('types'),
    __metadata("design:paramtypes", [db_service_1.DbService])
], TypesController);
let HeadlinesController = class HeadlinesController {
    constructor(db) {
        this.db = db;
    }
    list(q, req) {
        let arr = [...this.db.data.headlines];
        const keyword = (q.keyword || '').trim();
        if (keyword)
            arr = arr.filter((h) => h.title.includes(keyword) || h.content.includes(keyword));
        if (q.typeId)
            arr = arr.filter((h) => h.typeId === Number(q.typeId));
        if (q.uid)
            arr = arr.filter((h) => h.uid === Number(q.uid));
        const sortMap = { like: 'like_count', comment: 'comment_count', view: 'view_count' };
        if (q.sort === 'time' || !q.sort) {
            arr.sort((a, b) => (a.create_time < b.create_time ? 1 : -1));
        }
        else {
            const key = sortMap[q.sort] || 'like_count';
            arr.sort((a, b) => b[key] - a[key]);
        }
        const page = Math.max(1, Number(q.page) || 1);
        const pageSize = Math.max(1, Number(q.pageSize) || 10);
        const total = arr.length;
        const list = arr.slice((page - 1) * pageSize, page * pageSize).map((h) => {
            const t = this.db.data.types.find((x) => x.id === h.typeId);
            return {
                id: h.id,
                title: h.title,
                author: h.author,
                uid: h.uid,
                typeId: h.typeId,
                typeName: t ? t.name : '',
                view_count: h.view_count,
                like_count: h.like_count,
                comment_count: h.comment_count,
                create_time: h.create_time,
            };
        });
        return ok({ list, total, page, pageSize });
    }
    detail(id, req) {
        const h = this.db.data.headlines.find((x) => x.id === id);
        if (!h)
            throw fail('头条不存在');
        h.view_count = (h.view_count || 0) + 1;
        this.db.save();
        const user = (0, auth_1.optionalUser)(req, this.db.data.users);
        const liked = user ? this.db.data.likes.some((l) => l.hid === id && l.uid === user.id) : false;
        const t = this.db.data.types.find((x) => x.id === h.typeId);
        return ok({ ...h, typeName: t ? t.name : '', liked });
    }
    comments(id) {
        const arr = this.db.data.comments
            .filter((c) => c.hid === id)
            .sort((a, b) => (a.create_time > b.create_time ? 1 : -1));
        return ok(arr);
    }
    create(req, b) {
        const { title, content, typeId } = b || {};
        if (!title || !title.trim())
            throw fail('标题不能为空');
        if (!content)
            throw fail('内容不能为空');
        if (content.length > 5000)
            throw fail('内容不能超过 5000 字');
        if (!this.db.data.types.some((t) => t.id === Number(typeId)))
            throw fail('类型不存在');
        const h = {
            id: this.db.nextId('headlines'),
            uid: req.user.id,
            author: req.user.nickname,
            title: title.trim(),
            content,
            typeId: Number(typeId),
            view_count: 0,
            like_count: 0,
            comment_count: 0,
            create_time: this.db.now(),
            update_time: this.db.now(),
        };
        this.db.data.headlines.push(h);
        this.db.save();
        return ok(h);
    }
    update(req, id, b) {
        const h = this.db.data.headlines.find((x) => x.id === id);
        if (!h)
            throw fail('头条不存在');
        const isAdmin = req.user.role === 1;
        if (h.uid !== req.user.id && !isAdmin)
            throw fail('只能修改自己发布的头条');
        if (b.title !== undefined) {
            if (!String(b.title).trim())
                throw fail('标题不能为空');
            h.title = String(b.title).trim();
        }
        if (b.content !== undefined) {
            if (String(b.content).length > 5000)
                throw fail('内容不能超过 5000 字');
            h.content = b.content;
        }
        // 仅管理员可修改类型
        if (b.typeId !== undefined && isAdmin) {
            if (!this.db.data.types.some((t) => t.id === Number(b.typeId)))
                throw fail('类型不存在');
            h.typeId = Number(b.typeId);
        }
        h.update_time = this.db.now();
        this.db.save();
        return ok(h);
    }
    remove(req, id) {
        const h = this.db.data.headlines.find((x) => x.id === id);
        if (!h)
            throw fail('头条不存在');
        if (h.uid !== req.user.id && req.user.role !== 1)
            throw fail('无权删除该头条');
        this.db.data.headlines = this.db.data.headlines.filter((x) => x.id !== id);
        this.db.data.likes = this.db.data.likes.filter((l) => l.hid !== id);
        this.db.data.comments = this.db.data.comments.filter((c) => c.hid !== id);
        this.db.save();
        return ok();
    }
    like(req, id) {
        const h = this.db.data.headlines.find((x) => x.id === id);
        if (!h)
            throw fail('头条不存在');
        const uid = req.user.id;
        const existed = this.db.data.likes.find((l) => l.hid === id && l.uid === uid);
        if (existed) {
            // 取消点赞
            this.db.data.likes = this.db.data.likes.filter((l) => l !== existed);
            h.like_count = Math.max(0, (h.like_count || 0) - 1);
            this.db.save();
            return ok({ liked: false, likeCount: h.like_count, msg: '已取消点赞' });
        }
        this.db.data.likes.push({ id: this.db.nextId('likes'), hid: id, uid });
        h.like_count = (h.like_count || 0) + 1;
        this.db.save();
        return ok({ liked: true, likeCount: h.like_count });
    }
    addComment(req, id, b) {
        const h = this.db.data.headlines.find((x) => x.id === id);
        if (!h)
            throw fail('头条不存在');
        const content = (b && b.content || '').trim();
        if (!content)
            throw fail('评论内容不能为空');
        if (content.length > 500)
            throw fail('评论不能超过 500 字');
        const parentCid = Number(b && b.parentCid) || 0;
        if (parentCid !== 0 && !this.db.data.comments.some((c) => c.id === parentCid && c.hid === id)) {
            throw fail('被回复的评论不存在');
        }
        const c = {
            id: this.db.nextId('comments'),
            hid: id,
            uid: req.user.id,
            author: req.user.nickname,
            content,
            parent_cid: parentCid,
            create_time: this.db.now(),
        };
        this.db.data.comments.push(c);
        h.comment_count = (h.comment_count || 0) + 1;
        this.db.save();
        return ok(c);
    }
};
exports.HeadlinesController = HeadlinesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], HeadlinesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], HeadlinesController.prototype, "detail", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], HeadlinesController.prototype, "comments", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(authGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], HeadlinesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(authGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", void 0)
], HeadlinesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(authGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], HeadlinesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    (0, common_1.UseGuards)(authGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], HeadlinesController.prototype, "like", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    (0, common_1.UseGuards)(authGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", void 0)
], HeadlinesController.prototype, "addComment", null);
exports.HeadlinesController = HeadlinesController = __decorate([
    (0, common_1.Controller)('headlines'),
    __metadata("design:paramtypes", [db_service_1.DbService])
], HeadlinesController);
let CommentsController = class CommentsController {
    constructor(db) {
        this.db = db;
    }
    remove(req, id) {
        const c = this.db.data.comments.find((x) => x.id === id);
        if (!c)
            throw fail('评论不存在');
        if (c.uid !== req.user.id && req.user.role !== 1)
            throw fail('无权删除该评论');
        // 级联删除子评论（含多级）
        const toDelete = new Set([id]);
        let changed = true;
        while (changed) {
            changed = false;
            for (const item of this.db.data.comments) {
                if (toDelete.has(item.parent_cid) && !toDelete.has(item.id)) {
                    toDelete.add(item.id);
                    changed = true;
                }
            }
        }
        const hid = c.hid;
        const before = this.db.data.comments.length;
        this.db.data.comments = this.db.data.comments.filter((x) => !toDelete.has(x.id));
        const removed = before - this.db.data.comments.length;
        const h = this.db.data.headlines.find((x) => x.id === hid);
        if (h)
            h.comment_count = Math.max(0, (h.comment_count || 0) - removed);
        this.db.save();
        return ok({ removed });
    }
};
exports.CommentsController = CommentsController;
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(authGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "remove", null);
exports.CommentsController = CommentsController = __decorate([
    (0, common_1.Controller)('comments'),
    __metadata("design:paramtypes", [db_service_1.DbService])
], CommentsController);
let AdminController = class AdminController {
    constructor(db) {
        this.db = db;
    }
    comments(q) {
        let arr = [...this.db.data.comments];
        if (q.hid)
            arr = arr.filter((c) => c.hid === Number(q.hid));
        if (q.uid)
            arr = arr.filter((c) => c.uid === Number(q.uid));
        if (q.keyword) {
            const k = q.keyword.trim();
            arr = arr.filter((c) => c.content.includes(k) || c.author.includes(k));
        }
        arr.sort((a, b) => (a.create_time > b.create_time ? 1 : -1));
        return ok(arr);
    }
    headlines(q) {
        let arr = [...this.db.data.headlines];
        if (q.uid)
            arr = arr.filter((h) => h.uid === Number(q.uid));
        if (q.keyword) {
            const k = q.keyword.trim();
            arr = arr.filter((h) => h.title.includes(k) || h.author.includes(k));
        }
        arr.sort((a, b) => (a.create_time < b.create_time ? 1 : -1));
        return ok(arr);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('comments'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "comments", null);
__decorate([
    (0, common_1.Get)('headlines'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "headlines", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(adminGuard),
    __metadata("design:paramtypes", [db_service_1.DbService])
], AdminController);
let NoticesController = class NoticesController {
    constructor(db) {
        this.db = db;
    }
    list(keyword) {
        let arr = [...this.db.data.notices].sort((a, b) => (a.create_time < b.create_time ? 1 : -1));
        if (keyword) {
            arr = arr.filter((n) => n.title.includes(keyword) || n.content.includes(keyword));
        }
        return ok(arr);
    }
    create(b) {
        const title = (b && b.title || '').trim();
        const content = (b && b.content || '').trim();
        if (!title || !content)
            throw fail('标题和内容不能为空');
        const n = {
            id: this.db.nextId('notices'),
            title,
            content,
            remark: (b && b.remark) || '',
            create_time: this.db.now(),
        };
        this.db.data.notices.push(n);
        this.db.save();
        return ok(n);
    }
    update(id, b) {
        const n = this.db.data.notices.find((x) => x.id === id);
        if (!n)
            throw fail('公告不存在');
        if (b.title !== undefined)
            n.title = String(b.title).trim();
        if (b.content !== undefined)
            n.content = String(b.content).trim();
        if (b.remark !== undefined)
            n.remark = b.remark;
        this.db.save();
        return ok(n);
    }
    remove(id) {
        const n = this.db.data.notices.find((x) => x.id === id);
        if (!n)
            throw fail('公告不存在');
        this.db.data.notices = this.db.data.notices.filter((x) => x.id !== id);
        this.db.save();
        return ok();
    }
};
exports.NoticesController = NoticesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NoticesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(adminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NoticesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(adminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], NoticesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(adminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NoticesController.prototype, "remove", null);
exports.NoticesController = NoticesController = __decorate([
    (0, common_1.Controller)('notices'),
    __metadata("design:paramtypes", [db_service_1.DbService])
], NoticesController);
let StatsController = class StatsController {
    constructor(db) {
        this.db = db;
    }
    hot(q) {
        const keyMap = { like: 'like_count', comment: 'comment_count', view: 'view_count' };
        const key = keyMap[q.sort] || 'like_count';
        const arr = [...this.db.data.headlines].sort((a, b) => b[key] - a[key]);
        const page = Math.max(1, Number(q.page) || 1);
        const pageSize = Math.max(1, Number(q.pageSize) || 10);
        const list = arr.slice((page - 1) * pageSize, page * pageSize).map((h, i) => {
            const t = this.db.data.types.find((x) => x.id === h.typeId);
            return { rank: (page - 1) * pageSize + i + 1, ...h, typeName: t ? t.name : '' };
        });
        return ok({ list, total: arr.length, page, pageSize });
    }
    users() {
        const list = this.db.data.users.map((u) => {
            const headlines = this.db.data.headlines.filter((h) => h.uid === u.id).length;
            const comments = this.db.data.comments.filter((c) => c.uid === u.id).length;
            const likes = this.db.data.likes.filter((l) => l.uid === u.id).length;
            return {
                id: u.id,
                username: u.username,
                nickname: u.nickname,
                role: u.role,
                headlines,
                comments,
                likes,
                activity: headlines * 2 + comments + likes,
            };
        });
        list.sort((a, b) => b.activity - a.activity);
        return ok(list);
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, common_1.Get)('hot'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StatsController.prototype, "hot", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatsController.prototype, "users", null);
exports.StatsController = StatsController = __decorate([
    (0, common_1.Controller)('stats'),
    (0, common_1.UseGuards)(adminGuard),
    __metadata("design:paramtypes", [db_service_1.DbService])
], StatsController);
