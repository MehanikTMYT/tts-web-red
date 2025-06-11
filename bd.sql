-- Создание базы данных
CREATE DATABASE IF NOT EXISTS game_db;
USE game_db;

-- Таблица персонажей (NPC)
CREATE TABLE characters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  
  -- Характеристики (TINYINT UNSIGNED + CHECK для диапазона 0–10)
  int_stat TINYINT UNSIGNED DEFAULT 0 CHECK (int_stat BETWEEN 0 AND 20), -- Интеллект
  lck_stat TINYINT UNSIGNED DEFAULT 0 CHECK (lck_stat BETWEEN 0 AND 20), -- Ловкость
  tech_stat TINYINT UNSIGNED DEFAULT 0 CHECK (tech_stat BETWEEN 0 AND 20), -- Техника
  rea_stat TINYINT UNSIGNED DEFAULT 0 CHECK (rea_stat BETWEEN 0 AND 20), -- Реакция
  cha_stat TINYINT UNSIGNED DEFAULT 0 CHECK (cha_stat BETWEEN 0 AND 20), -- Харизма
  will_stat TINYINT UNSIGNED DEFAULT 0 CHECK (will_stat BETWEEN 0 AND 20), -- Воля
  move_stat TINYINT UNSIGNED DEFAULT 0 CHECK (move_stat BETWEEN 0 AND 20), -- Скорость
  body_stat TINYINT UNSIGNED DEFAULT 0 CHECK (body_stat BETWEEN 0 AND 20), -- Телосложение
  emp_stat TINYINT UNSIGNED DEFAULT 0 CHECK (emp_stat BETWEEN 0 AND 20), -- Эмпатия
  luck_stat TINYINT UNSIGNED DEFAULT 0 CHECK (luck_stat BETWEEN 0 AND 20), -- Удача
  
  stats JSON, -- Дополнительные характеристики
  -- Составной индекс для часто используемых характеристик
  INDEX idx_primary_stats (int_stat, lck_stat, tech_stat),
  -- Индивидуальные индексы для остальных характеристик
  INDEX idx_rea_stat (rea_stat),
  INDEX idx_cha_stat (cha_stat),
  INDEX idx_will_stat (will_stat),
  INDEX idx_move_stat (move_stat),
  INDEX idx_body_stat (body_stat),
  INDEX idx_emp_stat (emp_stat),
  INDEX idx_luck_stat (luck_stat)
) ENGINE=InnoDB;

-- Таблица навыков
CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  stat ENUM('int','lck','tech','rea','luck','cha','will','move','body','emp') NOT NULL, 
  modifier SMALLINT DEFAULT 0,
  is_custom BOOLEAN DEFAULT FALSE,
  -- Уникальный ключ для предотвращения дублирования
  UNIQUE KEY uk_skill_definition (label, stat),
  -- Индекс для поиска по характеристикам и модификаторам
  INDEX idx_skill_stat_mod (stat, modifier)
) ENGINE=InnoDB;

-- Промежуточная таблица для связи персонажей и навыков
CREATE TABLE character_skills (
  character_id INT NOT NULL,
  skill_id INT NOT NULL,
  PRIMARY KEY (character_id, skill_id), -- Комбинированный PK
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Пользователи
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash CHAR(60) NOT NULL, -- Хэш bcrypt
  reset_code CHAR(6),
  reset_expires DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- Индекс для авторизации
  INDEX idx_user_login (email, password_hash)
) ENGINE=InnoDB;

-- Коды подтверждения регистрации
CREATE TABLE verification_codes (
  email VARCHAR(255) PRIMARY KEY,
  code CHAR(6) NOT NULL,
  expires_at DATETIME DEFAULT CURRENT_TIMESTAMP + INTERVAL 5 MINUTE,
  attempts TINYINT DEFAULT 0,
  is_used BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB;

-- Таблица сцен
CREATE TABLE scenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  -- Индекс для фильтрации по пользователю
  INDEX idx_scenes_user (user_id)
) ENGINE=InnoDB;

-- Связь сцен и персонажей
CREATE TABLE scene_characters (
  scene_id INT NOT NULL,
  character_id INT NOT NULL,
  stat_modifiers JSON,
  PRIMARY KEY (scene_id, character_id),
  FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Модификаторы навыков в сценах
CREATE TABLE scene_skill_modifiers (
  scene_id INT NOT NULL,
  character_id INT NOT NULL,
  skill_id INT NOT NULL,
  modifier INT DEFAULT 0,
  PRIMARY KEY (scene_id, character_id, skill_id),
  FOREIGN KEY (scene_id, character_id) REFERENCES scene_characters(scene_id, character_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Таблица пользовательских навыков (без поля stat)
CREATE TABLE custom_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (user_id, name)
) ENGINE=InnoDB;

-- Промежуточная таблица для связи пользовательских навыков и характеристик
CREATE TABLE custom_skill_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  custom_skill_id INT NOT NULL,
  stat ENUM('int','lck','tech','rea','luck','cha','will','move','body','emp') NOT NULL,
  modifier SMALLINT DEFAULT 1,
  FOREIGN KEY (custom_skill_id) REFERENCES custom_skills(id),
  UNIQUE (custom_skill_id, stat)
) ENGINE=InnoDB;

-- Индекс для ускорения поиска по пользовательским навыкам и характеристикам
CREATE INDEX idx_custom_skill_stat ON custom_skill_stats(custom_skill_id, stat);

-- Массовая вставка навыков в одной транзакции 
START TRANSACTION;
INSERT INTO skills (label, stat, modifier, is_custom) VALUES
-- Все навыки с комментариями
('концентрация', 'will', 0, FALSE), -- [1] Воля [7]
('скрытие/раскрытие', 'int', 0, FALSE), -- [2] Интеллект [1]
('чтение по губам', 'int', 0, FALSE), -- [3] Интеллект [1]
('внимательность', 'int', 0, FALSE), -- [4] Интеллект [1]
('выслеживание', 'int', 0, FALSE), -- [5] Интеллект [1]
('атлетика', 'lck', 0, FALSE), -- [6] Ловкость [2]
('акробатика', 'lck', 0, FALSE), -- [7] Ловкость [2]
('танец', 'lck', 0, FALSE), -- [8] Ловкость [2]
('выносливость', 'will', 0, FALSE), -- [9] Воля [7]
('сопр.пыткам/наркотикам', 'will', 0, FALSE), -- [10] Воля [7]
('скрытность', 'lck', 0, FALSE), -- [11] Ловкость [2]
('вождение', 'rea', 0, FALSE), -- [12] Реакция [4]
('пилотирование (x2)', 'rea', 0, FALSE), -- [13] Реакция [4]
('судоходство', 'rea', 0, FALSE), -- [14] Реакция [4]
('верховая езда', 'rea', 0, FALSE), -- [15] Реакция [4]
('бухгалтерия', 'int', 0, FALSE), -- [16] Интеллект [1]
('обращение с животными', 'int', 0, FALSE), -- [17] Интеллект [1]
('бюрократия', 'int', 0, FALSE), -- [18] Интеллект [1]
('бизнес', 'int', 0, FALSE), -- [19] Интеллект [1]
('композиция', 'int', 0, FALSE), -- [20] Интеллект [1]
('криминология', 'int', 0, FALSE), -- [21] Интеллект [1]
('криптография', 'int', 0, FALSE), -- [22] Интеллект [1]
('дедукция', 'int', 0, FALSE), -- [23] Интеллект [1]
('образование', 'int', 0, FALSE), -- [24] Интеллект [1]
('азартные игры', 'int', 0, FALSE), -- [25] Интеллект [1]
('язык', 'int', 0, FALSE), -- [26] Интеллект [1]
('поиск информации', 'int', 0, FALSE), -- [27] Интеллект [1]
('знание местности', 'int', 0, FALSE), -- [28] Интеллект [1]
('место 1', 'int', 0, TRUE), -- [29] Интеллект [1]
('место 2', 'int', 0, TRUE), -- [30] Интеллект [1]
('место 3', 'int', 0, TRUE), -- [31] Интеллект [1]
('наука', 'int', 0, FALSE), -- [32] Интеллект [1]
('наука 1', 'int', 0, TRUE), -- [33] Интеллект [1]
('наука 2', 'int', 0, TRUE), -- [34] Интеллект [1]
('тактика', 'int', 0, FALSE), -- [35] Интеллект [1]
('выживание в пустыне', 'int', 0, FALSE), -- [36] Интеллект [1]
('рукопашный бой', 'lck', 0, FALSE), -- [37] Ловкость [2]
('уклонение', 'lck', 0, FALSE), -- [38] Ловкость [2]
('боевые искусства (x2)', 'lck', 0, FALSE), -- [39] Ловкость [2]
('оружие ближнего боя', 'lck', 0, FALSE), -- [40] Ловкость [2]
('актерское мастерство', 'cha', 0, FALSE), -- [41] Харизма [6]
('игра на инструментах', 'cha', 0, FALSE), -- [42] Харизма [6]
('инст 1', 'cha', 0, TRUE), -- [43] Харизма [6]
('инст 2', 'cha', 0, TRUE), -- [44] Харизма [6]
('стрельба из лука', 'rea', 0, FALSE), -- [45] Реакция [4]
('автоматический огонь (x2)', 'rea', 0, FALSE), -- [46] Реакция [4]
('пистолеты', 'rea', 0, FALSE), -- [47] Реакция [4]
('оружие крупного кол. (x2)', 'rea', 0, FALSE), -- [48] Реакция [4]
('тактическое оружие', 'rea', 0, FALSE), -- [49] Реакция [4]
('подкуп', 'cha', 0, FALSE), -- [50] Харизма [6]
('общение', 'emp', 0, FALSE), -- [51] Эмпатия [10]
('проницательность', 'emp', 0, FALSE), -- [52] Эмпатия [10]
('допрос', 'cha', 0, FALSE), -- [53] Харизма [6]
('убеждение', 'cha', 0, FALSE), -- [54] Харизма [6]
('уход за собой', 'cha', 0, FALSE), -- [55] Харизма [6]
('знаток улиц', 'cha', 0, FALSE), -- [56] Харизма [6]
('торговля', 'cha', 0, FALSE), -- [57] Харизма [6]
('гардероб и стиль', 'cha', 0, FALSE), -- [58] Харизма [6]
('авиационные технологии', 'tech', 0, FALSE), -- [59] Техника [3]
('знание техники', 'tech', 0, FALSE), -- [60] Техника [3]
('кибертехника', 'tech', 0, FALSE), -- [61] Техника [3]
('подрывник (x2)', 'tech', 0, FALSE), -- [62] Техника [3]
('электр./безоп. (x2)', 'tech', 0, FALSE), -- [63] Техника [3]
('первая помощь', 'tech', 0, FALSE), -- [64] Техника [3]
('фальсификация', 'tech', 0, FALSE), -- [65] Техника [3]
('автомеханика', 'tech', 0, FALSE), -- [66] Техника [3]
('художественное ремесло', 'tech', 0, FALSE), -- [67] Техника [3]
('парамедик (x2)', 'tech', 0, FALSE), -- [68] Техника [3]
('фотография/кино', 'tech', 0, FALSE), -- [69] Техника [3]
('взлом замков', 'tech', 0, FALSE), -- [70] Техника [3]
('карманник', 'tech', 0, FALSE), -- [71] Техника [3]
('морские технологии', 'tech', 0, FALSE), -- [72] Техника [3]
('оружейник', 'tech', 0, FALSE); -- [73] Техника [3]

COMMIT;

-- Создание пользователя и прав
CREATE USER IF NOT EXISTS 'cp_red_user'@'%' IDENTIFIED BY 'secure_password_2025';
GRANT ALL PRIVILEGES ON game_db.* TO 'cp_red_user'@'%';
FLUSH PRIVILEGES;