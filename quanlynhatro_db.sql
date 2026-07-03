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

 Date: 25/06/2026 19:15:34
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for bookings
-- ----------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings`  (
                             `booking_id` int NOT NULL AUTO_INCREMENT,
                             `tenant_id` int NOT NULL,
                             `room_id` int NOT NULL,
                             `move_in_date` date NOT NULL,
                             `num_people` int NOT NULL DEFAULT 1,
                             `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
                             `status` enum('PENDING','APPROVED','REJECTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
                             `reject_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                             `created_at` datetime NULL DEFAULT current_timestamp(),
                             PRIMARY KEY (`booking_id`) USING BTREE,
                             INDEX `tenant_id`(`tenant_id` ASC) USING BTREE,
                             INDEX `room_id`(`room_id` ASC) USING BTREE,
                             CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
                             CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of bookings
-- ----------------------------
INSERT INTO `bookings` VALUES (1, 8, 3, '2026-06-15', 2, '', 'APPROVED', NULL, '2026-06-06 09:45:23');
INSERT INTO `bookings` VALUES (2, 9, 17, '2026-06-09', 1, '', 'APPROVED', NULL, '2026-06-08 19:05:54');
INSERT INTO `bookings` VALUES (3, 5, 1, '2026-06-20', 1, '', 'APPROVED', NULL, '2026-06-08 19:11:52');
INSERT INTO `bookings` VALUES (4, 10, 14, '2026-06-30', 2, 'abc', 'APPROVED', NULL, '2026-06-09 19:11:11');
INSERT INTO `bookings` VALUES (5, 12, 1, '2026-06-18', 1, '', 'APPROVED', NULL, '2026-06-17 19:53:31');
INSERT INTO `bookings` VALUES (6, 7, 13, '2026-06-18', 1, '', 'APPROVED', NULL, '2026-06-17 20:05:48');
INSERT INTO `bookings` VALUES (7, 14, 3, '2026-06-30', 1, '', 'APPROVED', NULL, '2026-06-25 11:07:23');
INSERT INTO `bookings` VALUES (8, 14, 18, '2026-06-26', 1, '', 'APPROVED', NULL, '2026-06-25 11:09:36');

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
                              `refunded_amount` decimal(12, 2) NULL DEFAULT NULL,
                              PRIMARY KEY (`contract_id`) USING BTREE,
                              INDEX `room_id`(`room_id` ASC) USING BTREE,
                              INDEX `tenant_id`(`tenant_id` ASC) USING BTREE,
                              CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
                              CONSTRAINT `contracts_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of contracts
-- ----------------------------
INSERT INTO `contracts` VALUES (1, 7, 2, '2026-01-20', '2026-05-20', 3000000.00, 'ACTIVE', NULL);
INSERT INTO `contracts` VALUES (4, 4, 3, '2026-05-26', '2026-05-27', 3000000.00, 'ACTIVE', NULL);
INSERT INTO `contracts` VALUES (8, 3, 8, '2026-06-06', '2026-06-17', 0.00, 'EXPIRED', NULL);
INSERT INTO `contracts` VALUES (9, 17, 9, '2026-06-08', '2026-06-17', 0.00, 'EXPIRED', NULL);
INSERT INTO `contracts` VALUES (10, 1, 5, '2026-06-08', '2026-06-16', 1000000.00, 'EXPIRED', NULL);
INSERT INTO `contracts` VALUES (12, 1, 12, '2026-06-17', NULL, 1000000.00, 'ACTIVE', NULL);
INSERT INTO `contracts` VALUES (13, 13, 7, '2026-06-17', NULL, 1000000.00, 'ACTIVE', NULL);
INSERT INTO `contracts` VALUES (14, 3, 14, '2026-06-25', '2026-06-25', 1500000.00, 'EXPIRED', NULL);
INSERT INTO `contracts` VALUES (15, 18, 14, '2026-06-25', NULL, 1000000.00, 'ACTIVE', NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of invoice_details
-- ----------------------------
INSERT INTO `invoice_details` VALUES (1, 1, 1, 2, 3, 1, 3500.00);
INSERT INTO `invoice_details` VALUES (2, 1, 2, 1, 2, 1, 15000.00);
INSERT INTO `invoice_details` VALUES (3, 2, 1, 3, 2, -1, -3500.00);
INSERT INTO `invoice_details` VALUES (4, 2, 2, 2, 2, 0, 0.00);
INSERT INTO `invoice_details` VALUES (5, 3, 1, 3, 5, 2, 7000.00);
INSERT INTO `invoice_details` VALUES (6, 3, 2, 2, 4, 2, 30000.00);
INSERT INTO `invoice_details` VALUES (7, 4, 1, 0, 15, 15, 52500.00);
INSERT INTO `invoice_details` VALUES (8, 4, 2, 0, 1, 1, 15000.00);
INSERT INTO `invoice_details` VALUES (9, 5, 1, 0, 2, 2, 7000.00);
INSERT INTO `invoice_details` VALUES (10, 5, 2, 0, 1, 1, 15000.00);
INSERT INTO `invoice_details` VALUES (11, 6, 1, 3, 4, 1, 4000.00);
INSERT INTO `invoice_details` VALUES (12, 6, 2, 2, 3, 1, 15000.00);
INSERT INTO `invoice_details` VALUES (13, 7, 1, 0, 3, 3, 12000.00);
INSERT INTO `invoice_details` VALUES (14, 7, 2, 0, 2, 2, 30000.00);

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
                             `room_rent` decimal(12, 2) NULL DEFAULT 0.00,
                             PRIMARY KEY (`invoice_id`) USING BTREE,
                             INDEX `room_id`(`room_id` ASC) USING BTREE,
                             CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of invoices
-- ----------------------------
INSERT INTO `invoices` VALUES (1, 1, '05/2026', 18500.00, 'PAID', '2026-05-18 08:17:04', 0.00);
INSERT INTO `invoices` VALUES (2, 1, '05/2026', -3500.00, 'PAID', '2026-05-19 09:24:09', 0.00);
INSERT INTO `invoices` VALUES (3, 7, '05/2026', 37000.00, 'PAID', '2026-05-19 09:30:56', 0.00);
INSERT INTO `invoices` VALUES (4, 13, '06/2026', 67500.00, 'PAID', '2026-06-05 08:38:38', 0.00);
INSERT INTO `invoices` VALUES (5, 6, '06/2026', 22000.00, 'PAID', '2026-06-05 08:39:01', 0.00);
INSERT INTO `invoices` VALUES (6, 1, '07/2026', 19000.00, 'PAID', '2026-06-08 19:12:48', 0.00);
INSERT INTO `invoices` VALUES (7, 14, '07/2026', 42000.00, 'PAID', '2026-06-17 19:41:56', 0.00);

-- ----------------------------
-- Table structure for issues
-- ----------------------------
DROP TABLE IF EXISTS `issues`;
CREATE TABLE `issues`  (
                           `issue_id` int NOT NULL AUTO_INCREMENT,
                           `tenant_id` int NOT NULL,
                           `room_id` int NOT NULL,
                           `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                           `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
                           `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PENDING',
                           `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
                           PRIMARY KEY (`issue_id`) USING BTREE,
                           INDEX `tenant_id`(`tenant_id` ASC) USING BTREE,
                           INDEX `room_id`(`room_id` ASC) USING BTREE,
                           CONSTRAINT `issues_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
                           CONSTRAINT `issues_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of issues
-- ----------------------------
INSERT INTO `issues` VALUES (1, 5, 1, 'cháy bóng đèn', 'bóng đèn ngoài sân đã bị cháy', 'RESOLVED', '2026-06-04 10:04:12');
INSERT INTO `issues` VALUES (2, 9, 17, 'nghẽn đường dẫn nước', 'ống vòi sen bị tắt, nước yếu', 'PENDING', '2026-06-08 19:09:43');
INSERT INTO `issues` VALUES (3, 14, 18, 'cháy bóng đèn', 'đèn nhà vệ sinh bị cháy', 'PENDING', '2026-06-25 11:21:31');
INSERT INTO `issues` VALUES (4, 14, 18, 'gãy ống nước', 'Ống dẫn nước bị bể', 'PENDING', '2026-06-25 11:22:50');

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
                          `floor` int NULL DEFAULT 1,
                          `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
                          `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'AVAILABLE',
                          `image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                          PRIMARY KEY (`room_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of rooms
-- ----------------------------
INSERT INTO `rooms` VALUES (1, '101', 'Phòng đơn', 3500000.00, 25, 1, NULL, 'OCCUPIED', '/uploads/rooms/room_1_1782360105607.png');
INSERT INTO `rooms` VALUES (2, '102', 'Phòng đơn', 3000000.00, 20, 1, NULL, 'OCCUPIED', '/uploads/rooms/room_2_1782360323468.jpg');
INSERT INTO `rooms` VALUES (3, '103', 'Phòng đôi', 5000000.00, 25, 2, NULL, 'AVAILABLE', '/uploads/rooms/room_3_1782360327305.jpg');
INSERT INTO `rooms` VALUES (4, '104', 'Chung cư mini', 6000000.00, NULL, 1, NULL, 'OCCUPIED', NULL);
INSERT INTO `rooms` VALUES (6, '106', 'Chung cư mini', 6000000.00, NULL, 1, NULL, 'AVAILABLE', NULL);
INSERT INTO `rooms` VALUES (7, '107', 'Phòng đôi', 5000000.00, NULL, 1, NULL, 'OCCUPIED', NULL);
INSERT INTO `rooms` VALUES (8, '108', 'Phòng đơn', 3500000.00, NULL, 1, NULL, 'OCCUPIED', NULL);
INSERT INTO `rooms` VALUES (11, '109', 'Phòng đôi', 5000000.00, 30, 2, NULL, 'AVAILABLE', NULL);
INSERT INTO `rooms` VALUES (13, '110', 'Phòng đơn', 3000000.00, 20, 1, NULL, 'OCCUPIED', NULL);
INSERT INTO `rooms` VALUES (14, '111', 'Phòng đôi', 4000000.00, 25, 1, NULL, 'AVAILABLE', NULL);
INSERT INTO `rooms` VALUES (17, '112', 'Phòng đơn', 3000000.00, 20, 1, NULL, 'AVAILABLE', NULL);
INSERT INTO `rooms` VALUES (18, '105', 'Phòng đơn', 3000000.00, 20, 1, NULL, 'OCCUPIED', '/uploads/rooms/room_18_1782360403035.png');

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
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of services
-- ----------------------------
INSERT INTO `services` VALUES (1, 'Điện', 4000.00, 'kWh');
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
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of tenants
-- ----------------------------
INSERT INTO `tenants` VALUES (1, NULL, '058204001123', '0133456789', NULL, 'Phước mỹ');
INSERT INTO `tenants` VALUES (2, NULL, '058204001122', '0123456789', NULL, 'Tháp Chàm');
INSERT INTO `tenants` VALUES (3, NULL, '058204001123', '0123456789', NULL, 'Ninh Thuận');
INSERT INTO `tenants` VALUES (4, 5, '058204001987', '0359994735', NULL, 'Phan Rang Thap Cham');
INSERT INTO `tenants` VALUES (5, 6, '058204001182', '0123456745', NULL, 'Tháp Chàm');
INSERT INTO `tenants` VALUES (6, NULL, '051204001123', '0908457289', NULL, 'Phước Mỹ');
INSERT INTO `tenants` VALUES (7, 8, '054200001135', '0983478562', NULL, 'Ha noi');
INSERT INTO `tenants` VALUES (8, 9, '054200001138', '0983478598', NULL, 'TpHCM');
INSERT INTO `tenants` VALUES (9, 10, '058204001174', '0359994735', NULL, 'Phan Rang Thap Cham');
INSERT INTO `tenants` VALUES (10, 11, '058204001125', '0898744912', NULL, 'Đài sơn');
INSERT INTO `tenants` VALUES (11, 12, '058204001987', '0383210319', NULL, 'Phan Rang');
INSERT INTO `tenants` VALUES (12, 13, '058204001987', '0234782937', NULL, 'Phan Rang Thap Cham');
INSERT INTO `tenants` VALUES (13, 14, '058204001933', '0328782944', NULL, 'Phan Rang');
INSERT INTO `tenants` VALUES (14, 15, '058204001987', '0359994254', NULL, 'Thuận Bắc');

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
                          `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                          `avatar_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                          PRIMARY KEY (`user_id`) USING BTREE,
                          UNIQUE INDEX `email`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (5, 'Admin', '$2b$10$HRy/uHPgGw87l456xPLC2OhM7rOeQfP1krsMH27ecpXPe1TMUqXFa', 'ADMIN', 'Phạm Văn Thế Quân', 'ACTIVE', '2026-05-21 09:25:15', NULL, NULL);
INSERT INTO `users` VALUES (6, 'abc', '$2b$10$5VTwe5HzbbhtpjGohFOFQeY/VsTjT3rv8cIOWo6tLg3ccrvaAoZOW', 'TENANT', 'nguyễn văn A', 'ACTIVE', '2026-05-21 09:34:05', NULL, NULL);
INSERT INTO `users` VALUES (8, 'phong', '$2b$10$m8kH/auHB.wyrs4fqa9FPu0itzwUlaNJY1xUrgCpXDBRWrJDmgGfC', 'TENANT', 'bxphong', 'ACTIVE', '2026-06-05 08:17:02', NULL, NULL);
INSERT INTO `users` VALUES (9, 'phu', '$2b$10$WRYFocvJ4a/kW1ZLUu7Yse1lkMIudbGzjG.zP5Rlc2igIpsIQ/.BS', 'TENANT', 'bxphu', 'ACTIVE', '2026-06-06 09:14:20', NULL, NULL);
INSERT INTO `users` VALUES (10, 'quân', '$2b$10$UjIpjm10T4RtUg7JhVotRe5OTvJPzas.iLuDXLfLEzB11A4KcwaOC', 'TENANT', 'pvtquan', 'ACTIVE', '2026-06-08 19:03:56', NULL, NULL);
INSERT INTO `users` VALUES (11, 'Trà', '$2b$10$.oLizY0tC/duNNWB4vbR5./s72b5heZAGOifMJodxw.6koAXd3ZWm', 'TENANT', 'Hồ thị minh trà', 'ACTIVE', '2026-06-09 19:10:29', NULL, NULL);
INSERT INTO `users` VALUES (12, 'phu', '$2b$10$/vl.8r1mBxGrdULgzfYTj.6ys0M93fjy9L2En5lLi7ESNBs0bNVCK', 'TENANT', 'nguyen van b', 'ACTIVE', '2026-06-16 14:49:43', NULL, NULL);
INSERT INTO `users` VALUES (13, 'Nga', '$2b$10$auV.sBzR/QJZieGoBIR61.0Ce7qXu6O7B21i8GKRh2X85XnLBA0XW', 'TENANT', 'Quân Thế', 'ACTIVE', '2026-06-17 19:52:12', NULL, NULL);
INSERT INTO `users` VALUES (14, 'Quoc', '$2b$10$LHmzuHICgCLVeUvDtexQruOMo1Ql5YhdPrLK8P5byBJmmbffem.wq', 'TENANT', 'Pham Minh Quoc', 'ACTIVE', '2026-06-20 19:13:24', 'minhquoc123@gmail.com', NULL);
INSERT INTO `users` VALUES (15, 'Hiếu', '$2b$10$SJL/qFAbJmqFe.fTmq2mFukWTAm9R2gvtTQwBuXeorZmSOhhQ6Rmq', 'TENANT', 'Trần Nam Hiếu', 'ACTIVE', '2026-06-25 11:01:05', 'namhieu123@gmail.com', NULL);

SET FOREIGN_KEY_CHECKS = 1;
