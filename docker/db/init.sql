CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  type ENUM('อบรม', 'แข่งขัน', 'สุขภาพ', 'ออนไลน์', 'อื่นๆ'),
  date DATE,
  max_participants INT,
  status ENUM('เปิดรับ', 'เต็ม', 'หมดเขต') DEFAULT 'เปิดรับ'
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  type ENUM('อบรม', 'แข่งขัน', 'สุขภาพ', 'ออนไลน์', 'อื่นๆ'),
  date DATE,
  max_participants INT,
  status ENUM('เปิดรับ', 'เต็ม', 'หมดเขต') DEFAULT 'เปิดรับ'
);

CREATE TABLE joins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT,
  name VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  image_url TEXT,
  status ENUM('รอดำเนินการ', 'ลงทะเบียนสำเร็จ', 'ยกเลิก') DEFAULT 'รอดำเนินการ',
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- ผู้ใช้
INSERT INTO users (name, email, password, role)
VALUES ('แอดมิน', 'admin@example.com', 'admin123', 'admin');

-- กิจกรรม
INSERT INTO events (title, description, type, date, max_participants)
VALUES
('กิจกรรมเรียนรู้', 'เข้าร่วมฟรีพร้อมประกาศนียบัตร', 'อบรม', '2025-12-10', 100),
('กิจกรรมแข่งขัน', 'ลุ้นรับของรางวัลมากมาย', 'แข่งขัน', '2025-12-15', 200);

-- การลงทะเบียน
INSERT INTO joins (event_id, name, phone, email, status, registered_at) VALUES
(1, 'ทดสอบ ระบบ', 'XXXXXX1234', 'testXXXX@gmail.com', 'รอดำเนินการ', '2024-12-16 10:00:00'),
(1, 'ทดสอบ ระบบ', 'XXXXXX1234', 'testXXXX@gmail.com', 'ลงทะเบียนสำเร็จ', '2024-12-16 10:00:00'),
(1, 'ทดสอบ ระบบ', 'XXXXXX1234', 'testXXXX@gmail.com', 'ยกเลิก', '2024-12-16 10:00:00');
