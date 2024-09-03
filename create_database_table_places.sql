-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------

CREATE TABLE `places` (
  `place_id` int UNSIGNED NOT NULL,
  `user_id` char(11) NOT NULL,
  `participant_id` char(32) DEFAULT NULL,
  `time_start` datetime NOT NULL,
  `time_end` datetime NOT NULL,
  `place_num` tinyint UNSIGNED NOT NULL,
  `place_name` varchar(60) NOT NULL,
  `place_lat` float(10,6) NOT NULL,
  `place_lng` float(10,6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
ALTER TABLE `places`
  ADD PRIMARY KEY (`place_id`);
--
ALTER TABLE `places`
  MODIFY `place_id` int UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
