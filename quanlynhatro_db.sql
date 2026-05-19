/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : quanlynhatro_db

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 19/05/2026 10:24:46
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for contracts
-- ----------------------------
DROP TABLE IF EXISTS `contracts`;
CREATE TABLE `contracts`  (
  `contract_id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NULL DEFAULT NULL,
  `deposit_amount` decimal(10, 2) NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`contract_id`) USING BTREE,
  INDEX `room_id`(`room_id` ASC) USING BTREE,
  INDEX `tenant_id`(`tenant_id` ASC) USING BTREE,
  CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `contracts_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of contracts
-- ----------------------------
INSERT INTO `contracts` VALUES (1, 7, 2, '2026-01-20', '2026-05-20', 3000000.00, 'ACTIVE');
INSERT INTO `contracts` VALUES (4, 4, 3, '2026-05-26', '2026-05-27', 3000000.00, 'ACTIVE');

-- ----------------------------
-- Table structure for invoice_details
-- ----------------------------
DROP TABLE IF EXISTS `invoice_details`;
CREATE TABLE `invoice_details`  (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int NOT NULL,
  `service_id` int NOT NULL,
  `old_index` int NULL DEFAULT 0,
  `new_index` int NULL DEFAULT 0,
  `quantity` int NOT NULL,
  `sub_total` decimal(10, 2) NOT NULL,
  PRIMARY KEY (`detail_id`) USING BTREE,
  INDEX `invoice_id`(`invoice_id` ASC) USING BTREE,
  INDEX `service_id`(`service_id` ASC) USING BTREE,
  CONSTRAINT `invoice_details_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `invoice_details_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of invoice_details
-- ----------------------------
INSERT INTO `invoice_details` VALUES (1, 1, 1, 2, 3, 1, 3500.00);
INSERT INTO `invoice_details` VALUES (2, 1, 2, 1, 2, 1, 15000.00);
INSERT INTO `invoice_details` VALUES (3, 2, 1, 3, 2, -1, -3500.00);
INSERT INTO `invoice_details` VALUES (4, 2, 2, 2, 2, 0, 0.00);
INSERT INTO `invoice_details` VALUES (5, 3, 1, 3, 5, 2, 7000.00);
INSERT INTO `invoice_details` VALUES (6, 3, 2, 2, 4, 2, 30000.00);

-- ----------------------------
-- Table structure for invoices
-- ----------------------------
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices`  (
  `invoice_id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `billing_month` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(12, 2) NULL DEFAULT 0.00,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'UNPAID',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`invoice_id`) USING BTREE,
  INDEX `room_id`(`room_id` ASC) USING BTREE,
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of invoices
-- ----------------------------
INSERT INTO `invoices` VALUES (1, 1, '05/2026', 18500.00, 'PAID', '2026-05-18 08:17:04');
INSERT INTO `invoices` VALUES (2, 1, '05/2026', -3500.00, 'PAID', '2026-05-19 09:24:09');
INSERT INTO `invoices` VALUES (3, 7, '05/2026', 37000.00, 'PAID', '2026-05-19 09:30:56');

-- ----------------------------
-- Table structure for rooms
-- ----------------------------
DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms`  (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `room_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `base_price` decimal(10, 2) NULL DEFAULT NULL,
  `area` int NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'AVAILABLE',
  PRIMARY KEY (`room_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rooms
-- ----------------------------
INSERT INTO `rooms` VALUES (1, '101', 'Phòng đơn', 3500000.00, 25, NULL, 'Đã thuê');
INSERT INTO `rooms` VALUES (2, '102', 'Phòng đơn', 4000000.00, NULL, NULL, 'OCCUPIED');
INSERT INTO `rooms` VALUES (3, '103', 'Phòng đôi', 5000000.00, NULL, NULL, 'AVAILABLE');
INSERT INTO `rooms` VALUES (4, '104', 'Chung cư mini', 6000000.00, NULL, NULL, 'OCCUPIED');
INSERT INTO `rooms` VALUES (6, '106', 'Chung cư mini', 6000000.00, NULL, NULL, 'AVAILABLE');
INSERT INTO `rooms` VALUES (7, '107', 'Phòng đôi', 5000000.00, NULL, NULL, 'OCCUPIED');
INSERT INTO `rooms` VALUES (8, '108', 'Phòng đơn', 3500000.00, NULL, NULL, 'OCCUPIED');
INSERT INTO `rooms` VALUES (11, '109', 'Phòng đôi', 6000000.00, NULL, NULL, 'AVAILABLE');
INSERT INTO `rooms` VALUES (13, '110', 'Phòng đơn', 3000000.00, NULL, NULL, 'AVAILABLE');

-- ----------------------------
-- Table structure for services
-- ----------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services`  (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `service_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_price` decimal(10, 2) NOT NULL,
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`service_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of services
-- ----------------------------
INSERT INTO `services` VALUES (1, 'Điện', 3500.00, 'kWh');
INSERT INTO `services` VALUES (2, 'Nước', 15000.00, 'Khối');

-- ----------------------------
-- Table structure for tenants
-- ----------------------------
DROP TABLE IF EXISTS `tenants`;
CREATE TABLE `tenants`  (
  `tenant_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL DEFAULT NULL,
  `cccd` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `dob` date NULL DEFAULT NULL,
  `hometown` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`tenant_id`) USING BTREE,
  UNIQUE INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `tenants_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tenants
-- ----------------------------
INSERT INTO `tenants` VALUES (1, 2, '058204001123', '0133456789', NULL, 'Phước mỹ');
INSERT INTO `tenants` VALUES (2, 3, '058204001122', '0123456789', NULL, 'Tháp Chàm');
INSERT INTO `tenants` VALUES (3, 4, '058204001123', '0123456789', NULL, 'Ninh Thuận');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'TENANT',
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'ACTIVE',
  `create_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '123', 'ADMIN', 'Chủ trọ Thế Quân', 'ACTIVE', '2026-03-30 18:35:55');
INSERT INTO `users` VALUES (2, 'Phong', '123456', 'TENANT', 'Bùi Xuân Phong', 'ACTIVE', '2026-04-19 07:35:20');
INSERT INTO `users` VALUES (3, 'abc', '123', 'TENANT', 'Nguyễn Văn A', 'ACTIVE', '2026-05-17 08:12:18');
INSERT INTO `users` VALUES (4, 'Hiếu', '123', 'TENANT', 'Trần Nam Hiếu', 'ACTIVE', '2026-05-19 10:05:20');

SET FOREIGN_KEY_CHECKS = 1;
