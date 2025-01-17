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
exports.Tenant = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
let Tenant = class Tenant {
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Tenant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "domain", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Tenant.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, user => user.tenant),
    __metadata("design:type", Array)
], Tenant.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => customer_entity_1.Customer, customer => customer.tenant),
    __metadata("design:type", Array)
], Tenant.prototype, "customers", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Tenant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Tenant.prototype, "updatedAt", void 0);
exports.Tenant = Tenant = __decorate([
    (0, typeorm_1.Entity)()
], Tenant);
//# sourceMappingURL=tenant.entity.js.map