-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE users ADD CONSTRAINT uni_users_username UNIQUE (username);
ALTER TABLE users ADD CONSTRAINT uni_users_email UNIQUE (email);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- 角色表
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE roles ADD CONSTRAINT uni_roles_name UNIQUE (name);
ALTER TABLE roles ADD CONSTRAINT uni_roles_code UNIQUE (code);

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
CREATE INDEX IF NOT EXISTS idx_roles_deleted_at ON roles(deleted_at);

-- 权限表
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);
CREATE INDEX IF NOT EXISTS idx_permissions_deleted_at ON permissions(deleted_at);

-- 菜单表
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(100),
    component VARCHAR(255),
    redirect VARCHAR(255),
    parent_id UUID,
    sort INT DEFAULT 0,
    hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_menus_parent FOREIGN KEY (parent_id) REFERENCES menus(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_menus_path ON menus(path);
CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON menus(parent_id);
CREATE INDEX IF NOT EXISTS idx_menus_deleted_at ON menus(deleted_at);

-- 用户-角色关联表
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- 角色-权限关联表
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- 菜单-权限关联表
CREATE TABLE IF NOT EXISTS menu_permissions (
    menu_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    PRIMARY KEY (menu_id, permission_id),
    CONSTRAINT fk_menu_permissions_menu FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    CONSTRAINT fk_menu_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_permissions_menu_id ON menu_permissions(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_permissions_permission_id ON menu_permissions(permission_id);

-- 插入默认管理员用户
INSERT INTO users (id, username, email, password, status, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin',
    'admin@example.com',
    '$2a$10$CMVknVCPRcLRgThQHBOcKu055LTRGN2S61z43d/1O57GzJVA4knK6', -- 密码: admin123
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL,
    project_id INTEGER default 0,
    name TEXT NOT NULL,
    department TEXT ,
    position TEXT ,
    hire_date TEXT ,
    leave_date TEXT,
    salary NUMERIC default 0.00 ,
    tax_status NUMERIC default 0.00,
    id_card TEXT default '000000000000000000',
    npwp TEXT default '123',
    hierarchy_id TEXT default '0',
    hierarchy_name TEXT,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resign_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email TEXT default '123@123.com',
    basic_salary NUMERIC DEFAULT 0.00,
    housing_alw NUMERIC DEFAULT 0.00,
    position_alw NUMERIC DEFAULT 0.00,
    field_alw NUMERIC DEFAULT 0.00,
    fix_alw NUMERIC DEFAULT 0.00,
    meal_alw_day NUMERIC DEFAULT 0.00,
    transp_alw_day NUMERIC DEFAULT 0.00,
    pulsa_alw_day NUMERIC DEFAULT 0.00,
    att_alw_day NUMERIC DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tax_type TEXT DEFAULT 'TK/0',
    location_name TEXT DEFAULT 'Jakarta',
    pulsa_alw_month NUMERIC DEFAULT 0.00,
    housing_alw_tetap NUMERIC DEFAULT 0.00,
    delete_flag INTEGER DEFAULT 0,
    UNIQUE (project_id, employee_id)
);

CREATE TABLE IF NOT EXISTS salaries (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  project_id INTEGER DEFAULT 0,
  employee_id TEXT NOT NULL,
  tax_status NUMERIC DEFAULT 0,
  basic_salary NUMERIC DEFAULT 0.00,
  housing_alw NUMERIC DEFAULT 0.00,
  position_alw NUMERIC DEFAULT 0.00,
  field_alw NUMERIC DEFAULT 0.00,
  fix_alw NUMERIC DEFAULT 0.00,
  jmstk_alw NUMERIC DEFAULT 0.00,
  pension_alw NUMERIC DEFAULT 0.00,
  meal_alw NUMERIC DEFAULT 0.00,
  transp_alw NUMERIC DEFAULT 0.00,
  tax_alw_salary NUMERIC DEFAULT 0.00,
  tax_alw_phk NUMERIC DEFAULT 0.00,
  comp_phk NUMERIC DEFAULT 0.00,
  askes_bpjs_alw NUMERIC DEFAULT 0.00,
  med_alw NUMERIC DEFAULT 0.00,
  pulsa_alw NUMERIC DEFAULT 0.00,
  others NUMERIC DEFAULT 0.00,
  att_alw NUMERIC DEFAULT 0.00,
  housing_alw_tetap NUMERIC DEFAULT 0.00,
  religious_alw NUMERIC DEFAULT 0.00,
  rapel_basic_salary NUMERIC DEFAULT 0.00,
  rapel_jmstk_alw NUMERIC DEFAULT 0.00,
  incentive_alw NUMERIC DEFAULT 0.00,
  acting NUMERIC DEFAULT 0.00,
  performance_alw NUMERIC DEFAULT 0.00,
  trip_alw NUMERIC DEFAULT 0.00,
  ot1_wages NUMERIC DEFAULT 0.00,
  ot1_hour NUMERIC DEFAULT 0.00,
  ew1_hour NUMERIC DEFAULT 0.00,
  ew1_wages NUMERIC DEFAULT 0.00,
  ew2_hour NUMERIC DEFAULT 0.00,
  ew2_wages NUMERIC DEFAULT 0.00,
  ew3_hour NUMERIC DEFAULT 0.00,
  ew3_wages NUMERIC DEFAULT 0.00,
  correct_add NUMERIC DEFAULT 0.00,
  correct_sub NUMERIC DEFAULT 0.00,
  leav_comp NUMERIC DEFAULT 0.00,
  total_accept NUMERIC DEFAULT 0.00,
  jmstk_fee NUMERIC DEFAULT 0.00,
  pension_ded NUMERIC DEFAULT 0.00,
  tax_ded_salary NUMERIC DEFAULT 0.00,
  tax_ded_phk NUMERIC DEFAULT 0.00,
  askes_bpjs_ded NUMERIC DEFAULT 0.00,
  incentive_ded NUMERIC DEFAULT 0.00,
  loan_ded NUMERIC DEFAULT 0.00,
  absent_ded NUMERIC DEFAULT 0.00,
  absent_ded2 NUMERIC DEFAULT 0.00,
  net_accept NUMERIC DEFAULT 0.00,
  round_off_salary NUMERIC DEFAULT 0.00,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_net_wages NUMERIC DEFAULT 0.00,
  salary_slip_status TEXT DEFAULT '0',
  pulsa_alw_month NUMERIC DEFAULT 0.00,
  mandah_alw NUMERIC DEFAULT 0.00,
  is_calculate INTEGER DEFAULT 1,
  delete_flag INTEGER DEFAULT 0,
  UNIQUE (project_id, employee_id, month)
);

CREATE TABLE projects (
    id SERIAL NOT NULL PRIMARY KEY,
    project_name TEXT NOT NULL,
    project_abbr TEXT NOT NULL UNIQUE,
    start_time DATE NULL,
    end_time DATE NULL,
    manager TEXT NULL,
    contact_phone TEXT NULL,
    project_desc TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP  DEFAULT NULL,
    askes_alw INTEGER DEFAULT 1,
    status TEXT NULL DEFAULT 'active'
);

INSERT INTO project (project_name,project_abbr) VALUES
	 ('bohai_ho','bohai_ho '),
	 ('bdsi_downhole','bdsi_downhole'),
	 ('bdsi_mudlogging','bdsi_mudlogging'),
	 ('bohai_cmtg A4','bohai_cmtg A4'),
	 ('bohai_wireline','bohai_wireline'),
	 ('bdsi jambi','bdsi jambi'),
	 ('bdsi duri','bdsi duri');

CREATE TABLE attendances (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL,
    day1 TEXT DEFAULT '0',
    day2 TEXT DEFAULT '0',
    day3 TEXT DEFAULT '0',
    day4 TEXT DEFAULT '0',
    day5 TEXT DEFAULT '0',
    day6 TEXT DEFAULT '0',
    day7 TEXT DEFAULT '0',
    day8 TEXT DEFAULT '0',
    day9 TEXT DEFAULT '0',
    day10 TEXT DEFAULT '0',
    day11 TEXT DEFAULT '0',
    day12 TEXT DEFAULT '0',
    day13 TEXT DEFAULT '0',
    day14 TEXT DEFAULT '0',
    day15 TEXT DEFAULT '0',
    day16 TEXT DEFAULT '0',
    day17 TEXT DEFAULT '0',
    day18 TEXT DEFAULT '0',
    day19 TEXT DEFAULT '0',
    day20 TEXT DEFAULT '0',
    day21 TEXT DEFAULT '0',
    day22 TEXT DEFAULT '0',
    day23 TEXT DEFAULT '0',
    day24 TEXT DEFAULT '0',
    day25 TEXT DEFAULT '0',
    day26 TEXT DEFAULT '0',
    day27 TEXT DEFAULT '0',
    day28 TEXT DEFAULT '0',
    day29 TEXT DEFAULT '0',
    day30 TEXT DEFAULT '0',
    day31 TEXT DEFAULT '0',
    work INTEGER DEFAULT 0,
    project_id INTEGER,
    permission INTEGER DEFAULT 0,
    off INTEGER DEFAULT 0,
    absent INTEGER DEFAULT 0,
    sick INTEGER DEFAULT 0,
    standby INTEGER DEFAULT 0,
    ew NUMERIC DEFAULT 0,
    month TEXT NOT NULL,
    ot1 NUMERIC DEFAULT 0,
    ew1 NUMERIC DEFAULT 0,
    ew2 NUMERIC DEFAULT 0,
    ew3 NUMERIC DEFAULT 0,
    ot2 NUMERIC DEFAULT 0,
    ot3 NUMERIC DEFAULT 0,
    leave_replc NUMERIC DEFAULT 0,
    unpresent NUMERIC DEFAULT 0,
    total_days INTEGER DEFAULT 0,
    UNIQUE (employee_id, month, project_id)
);


CREATE TABLE salary_coefficient (
  id SERIAL PRIMARY KEY,
  c_jmstk_alw NUMERIC DEFAULT 0.0000,
  c_pension_alw NUMERIC DEFAULT 0.0000,
  c_askes_alw NUMERIC DEFAULT 0.0000,
  c_ot_hour1 NUMERIC DEFAULT 0.00,
  c_ot_wages1 NUMERIC DEFAULT 0.0000,
  c_ew_hour1 NUMERIC DEFAULT 0.00,
  c_ew_wages1 NUMERIC DEFAULT 0.0000,
  c_ew_hour2 NUMERIC DEFAULT 0.00,
  c_ew_wages2 NUMERIC DEFAULT 0.0000,
  c_ew_hour3 NUMERIC DEFAULT 0.00,
  c_ew_wages3 NUMERIC DEFAULT 0.0000,
  c_jmstk_fee NUMERIC DEFAULT 0.0000,
  c_pension_ded NUMERIC DEFAULT 0.0000,
  c_askes_ded NUMERIC DEFAULT 0.0000,
  jmstk_max NUMERIC DEFAULT 0.0000,
  pension_max NUMERIC DEFAULT 0.0000,
  askes_max NUMERIC DEFAULT 0.0000,
  askes_min NUMERIC DEFAULT 0.0000,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_delete INTEGER DEFAULT 0
);

INSERT INTO salary_coefficient (
  c_jmstk_alw,    -- 公积金补贴系数
  c_pension_alw,  -- 养老金补贴系数
  c_askes_alw,    -- 社保补贴系数
  c_ot_hour1,     -- 1倍加班费小时基数
  c_ot_wages1,    -- 1倍加班费系数
  c_ew_hour1,     -- 额外加班1档小时基数
  c_ew_wages1,    -- 额外加班1档系数
  c_ew_hour2,     -- 额外加班2档小时基数
  c_ew_wages2,    -- 额外加班2档系数
  c_ew_hour3,     -- 额外加班3档小时基数
  c_ew_wages3,    -- 额外加班3档系数
  c_jmstk_fee,    -- 公积金扣除系数
  c_pension_ded,  -- 养老金扣除系数
  c_askes_ded,     -- 社保扣除系数
  jmstk_max       -- 公积金补贴计算是基本工资最大限额
) VALUES (
  0.0489,   -- 公积金补贴5%
  0.02,   -- 养老金补贴3%
  0.04,   -- 社保补贴2%
  7.5,    -- 1倍加班按8小时/天计算
  173,    -- 1倍加班费系数（日常加班）
  29,    -- 额外加班1档每天最多4小时
  173,    -- 额外加班1档系数（周末加班）
  8,    -- 额外加班2档每天最多2小时
  20,    -- 额外加班2档系数（法定假日加班）
  12,    -- 额外加班3档每天最多1小时
  20,    -- 额外加班3档系数（深夜加班）
  0.0689,   -- 公积金扣除8%
  0.03,   -- 养老金扣除6%
  0.05,    -- 社保扣除5%
  10400    -- 公积金补贴计算是基本工资最大限额
);

CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    month TEXT NOT NULL,
    leave_comp NUMERIC default 0.00,
    med_alw NUMERIC default 0.00,
    others NUMERIC default 0.00,
    religious_alw NUMERIC default 0.00,
    rapel_basic_salary NUMERIC default 0.00,
    rapel_jmstk_alw NUMERIC default 0.00,
    incentive_alw NUMERIC default 0.00,
    acting NUMERIC default 0.00,
    performance_alw NUMERIC default 0.00,
    trip_alw NUMERIC default 0.00,
    ot2_wages NUMERIC default 0.00,
    ot3_wages NUMERIC default 0.00,
    comp_phk NUMERIC default 0.00,
    tax_alw_phk NUMERIC default 0.00,
    absent_ded NUMERIC default 0.00,
    absent_ded2 NUMERIC default 0.00,
    correct_add NUMERIC default 0.00,
    correct_sub NUMERIC default 0.00,
    incentive_ded NUMERIC default 0.00,
    loan_ded NUMERIC default 0.00,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tax_ded_phk NUMERIC DEFAULT 0.00,
    mandah_alw NUMERIC default 0.00,
    UNIQUE (employee_id, project_id, month)
);

CREATE TABLE system_config (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    config TEXT NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS licenses (
    id SERIAL PRIMARY KEY,  -- SERIAL 本身包含 int 类型，无需重复写 int
    license_key TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'inactive',
    activation_date TIMESTAMP,  -- 改为 TIMESTAMP，适配日期时间存储
    expiration_date TIMESTAMP,
    valid_until TIMESTAMP,
    company_name TEXT,
    employee_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE tax_rates (
    id SERIAL PRIMARY KEY,  -- PostgreSQL 自增主键（SERIAL 等价于 auto_increment）
    salary_min NUMERIC NOT NULL DEFAULT 0,  -- 用 NUMERIC 替代 REAL，避免浮点精度问题
    salary_max NUMERIC NOT NULL,  -- 金额类字段推荐用 NUMERIC
    tax_rate NUMERIC NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 1),  -- 税率（0-1）
    grade TEXT NOT NULL   -- 税率等级，保持唯一约束
);

INSERT INTO tax_rates (id,salary_min,salary_max,tax_rate,grade) VALUES
(0.0,5400000.0,0.0,'TK/0,TK/1,K/0'),
(400001.0,5650000.0,0.0025,'TK/0,TK/1,K/0'),
(650001.0,5950000.0,0.005,'TK/0,TK/1,K/0'),
(950001.0,6300000.0,0.0075,'TK/0,TK/1,K/0'),
(300001.0,6750000.0,0.01,'TK/0,TK/1,K/0'),
(750001.0,7500000.0,0.0125,'TK/0,TK/1,K/0'),
(500001.0,8550000.0,0.015,'TK/0,TK/1,K/0'),
(550001.0,9650000.0,0.0175,'TK/0,TK/1,K/0'),
(650001.0,10050000,0.02,'TK/0,TK/1,K/0'),
(10050001,10350000,0.0225,'TK/0,TK/1,K/0');
(10350001,10700000,0.025,'TK/0,TK/1,K/0'),
(10700001,11050000,0.03,'TK/0,TK/1,K/0'),
(11050001,11600000,0.035,'TK/0,TK/1,K/0'),
(11600001,12500000,0.04,'TK/0,TK/1,K/0'),
(12500001,13750000,0.05,'TK/0,TK/1,K/0'),
(13750001,15100000,0.06,'TK/0,TK/1,K/0'),
(15100001,16950000,0.07,'TK/0,TK/1,K/0'),
(16950001,19750000,0.08,'TK/0,TK/1,K/0'),
(19750001,24150000,0.09,'TK/0,TK/1,K/0'),
(24150001,26450000,0.1,'TK/0,TK/1,K/0');
(26450001,28000000,0.11,'TK/0,TK/1,K/0'),
(28000001,30050000,0.12,'TK/0,TK/1,K/0'),
(30050001,32400000,0.13,'TK/0,TK/1,K/0'),
(32400001,35400000,0.14,'TK/0,TK/1,K/0'),
(35400001,39100000,0.15,'TK/0,TK/1,K/0'),
(39100001,43850000,0.16,'TK/0,TK/1,K/0'),
(43850001,47800000,0.17,'TK/0,TK/1,K/0'),
(47800001,51400000,0.18,'TK/0,TK/1,K/0'),
(51400001,56300000,0.19,'TK/0,TK/1,K/0'),
(56300001,62200000,0.2,'TK/0,TK/1,K/0');
(62200001,68600000,0.21,'TK/0,TK/1,K/0'),
(68600001,77500000,0.22,'TK/0,TK/1,K/0'),
(77500001,89000000,0.23,'TK/0,TK/1,K/0'),
(89000001,103000000,0.24,'TK/0,TK/1,K/0'),
(103000001,125000000,0.25,'TK/0,TK/1,K/0'),
(125000001,157000000,0.26,'TK/0,TK/1,K/0'),
(157000001,206000000,0.27,'TK/0,TK/1,K/0'),
(206000001,337000000,0.28,'TK/0,TK/1,K/0'),
(337000001,454000000,0.29,'TK/0,TK/1,K/0'),
(454000001,550000000,0.3,'TK/0,TK/1,K/0');
(550000001,695000000,0.31,'TK/0,TK/1,K/0'),
(695000001,910000000,0.32,'TK/0,TK/1,K/0'),
(910000001,1400000000,0.33,'TK/0,TK/1,K/0'),
(1400000001,999999999999,0.34,'TK/0,TK/1,K/0'),
(0.0,6200000.0,0.0,'TK/2,TK/3,K/1,K/2'),
(6200001.0,6500000.0,0.0025,'TK/2,TK/3,K/1,K/2'),
(6500001.0,6850000.0,0.005,'TK/2,TK/3,K/1,K/2'),
(6850001.0,7300000.0,0.0075,'TK/2,TK/3,K/1,K/2'),
(7300001.0,9200000.0,0.01,'TK/2,TK/3,K/1,K/2'),
(9200001.0,10750000,0.015,'TK/2,TK/3,K/1,K/2');
(10750001,11250000,0.02,'TK/2,TK/3,K/1,K/2'),
(11250001,11600000,0.025,'TK/2,TK/3,K/1,K/2'),
(11600001,12600000,0.03,'TK/2,TK/3,K/1,K/2'),
(12600001,13600000,0.04,'TK/2,TK/3,K/1,K/2'),
(13600001,14950000,0.05,'TK/2,TK/3,K/1,K/2'),
(14950001,16400000,0.06,'TK/2,TK/3,K/1,K/2'),
(16400001,18450000,0.07,'TK/2,TK/3,K/1,K/2'),
(18450001,21850000,0.08,'TK/2,TK/3,K/1,K/2'),
(21850001,26000000,0.09,'TK/2,TK/3,K/1,K/2'),
(26000001,27700000,0.1,'TK/2,TK/3,K/1,K/2');
(27700001,29350000,0.11,'TK/2,TK/3,K/1,K/2'),
(29350001,31450000,0.12,'TK/2,TK/3,K/1,K/2'),
(31450001,33950000,0.13,'TK/2,TK/3,K/1,K/2'),
(33950001,37100000,0.14,'TK/2,TK/3,K/1,K/2'),
(37100001,41100000,0.15,'TK/2,TK/3,K/1,K/2'),
(41100001,45800000,0.16,'TK/2,TK/3,K/1,K/2'),
(45800001,49500000,0.17,'TK/2,TK/3,K/1,K/2'),
(49500001,53800000,0.18,'TK/2,TK/3,K/1,K/2'),
(53800001,58500000,0.19,'TK/2,TK/3,K/1,K/2'),
(58500001,64000000,0.2,'TK/2,TK/3,K/1,K/2');
(64000001,71000000,0.21,'TK/2,TK/3,K/1,K/2'),
(71000001,80000000,0.22,'TK/2,TK/3,K/1,K/2'),
(80000001,93000000,0.23,'TK/2,TK/3,K/1,K/2'),
(93000001,109000000,0.24,'TK/2,TK/3,K/1,K/2'),
(109000001,129000000,0.25,'TK/2,TK/3,K/1,K/2'),
(129000001,163000000,0.26,'TK/2,TK/3,K/1,K/2'),
(163000001,211000000,0.27,'TK/2,TK/3,K/1,K/2'),
(211000001,374000000,0.28,'TK/2,TK/3,K/1,K/2'),
(374000001,459000000,0.29,'TK/2,TK/3,K/1,K/2'),
(459000001,555000000,0.3,'TK/2,TK/3,K/1,K/2');
(555000001,704000000,0.31,'TK/2,TK/3,K/1,K/2'),
(704000001,957000000,0.32,'TK/2,TK/3,K/1,K/2'),
(957000001,1405000000,0.33,'TK/2,TK/3,K/1,K/2'),
(1405000001,999999999999,0.34,'TK/2,TK/3,K/1,K/2'),
(0.0,6600000.0,0.0,'K/3'),
(6600001.0,6950000.0,0.0025,'K/3'),
(6950001.0,7350000.0,0.005,'K/3'),
(7350001.0,7800000.0,0.0075,'K/3'),
(7800001.0,8850000.0,0.01,'K/3'),
(8850001.0,9800000.0,0.0125,'K/3');
(9800001.0,10950000,0.015,'K/3'),
(10950001,11200000,0.0175,'K/3'),
(11200001,12050000,0.02,'K/3'),
(12050001,12950000,0.03,'K/3'),
(12950001,14150000,0.04,'K/3'),
(14150001,15550000,0.05,'K/3'),
(15550001,17050000,0.06,'K/3'),
(17050001,19500000,0.07,'K/3'),
(19500001,22700000,0.08,'K/3');
(22700001,26600000,0.09,'K/3'),
(26600001,28100000,0.1,'K/3'),
(28100001,30100000,0.11,'K/3'),
(30100001,32600000,0.12,'K/3'),
(32600001,35400000,0.13,'K/3'),
(35400001,38900000,0.14,'K/3'),
(38900001,43000000,0.15,'K/3'),
(43000001,47400000,0.16,'K/3'),
(47400001,51200000,0.17,'K/3'),
(51200001,55800000,0.18,'K/3'),
(55800001,60400000,0.19,'K/3');
(60400001,66700000,0.2,'K/3'),
(66700001,74500000,0.21,'K/3'),
(74500001,83200000,0.22,'K/3'),
(83200001,95600000,0.23,'K/3'),
(95600001,110000000,0.24,'K/3'),
(110000001,134000000,0.25,'K/3'),
(134000001,169000000,0.26,'K/3'),
(169000001,221000000,0.27,'K/3'),
(221000001,390000000,0.28,'K/3'),
(390000001,463000000,0.29,'K/3');
(463000001,561000000,0.3,'K/3'),
(561000001,709000000,0.31,'K/3'),
(709000001,965000000,0.32,'K/3'),
(965000001,1419000000,0.33,'K/3'),
(1419000001,999999999999,0.34,'K/3');

CREATE TABLE tax_free_bases (
    id SERIAL PRIMARY KEY,  -- PostgreSQL 自增主键（替代 SQLite 的 INTEGER PRIMARY KEY）
    grade TEXT NOT NULL UNIQUE,  -- 等级（与税率表 grade 关联，保持唯一约束）
    free_tax_base NUMERIC NOT NULL DEFAULT 0  -- 免税基数（用 NUMERIC 避免浮点精度问题）
);
INSERT INTO tax_free_bases (grade, free_tax_base) VALUES
('TK/0', 54000000),
('TK/1', 58500000),
('TK/2', 63000000),
('TK/3', 67500000),
('K/0', 58500000),
('K/1', 63000000),
('K/2', 67500000),
('K/3', 72000000);


INSERT INTO salary_coefficient (
  c_jmstk_alw,    -- 公积金补贴系数
  c_pension_alw,  -- 养老金补贴系数
  c_askes_alw,    -- 社保补贴系数
  c_ot_hour1,     -- 1倍加班费小时基数
  c_ot_wages1,    -- 1倍加班费系数
  c_ew_hour1,     -- 额外加班1档小时基数
  c_ew_wages1,    -- 额外加班1档系数
  c_ew_hour2,     -- 额外加班2档小时基数
  c_ew_wages2,    -- 额外加班2档系数
  c_ew_hour3,     -- 额外加班3档小时基数
  c_ew_wages3,    -- 额外加班3档系数
  c_jmstk_fee,    -- 公积金扣除系数
  c_pension_ded,  -- 养老金扣除系数
  c_askes_ded,     -- 社保扣除系数
  jmstk_max        -- 公积金补贴计算是基本工资最大限额
) VALUES (
  0.0489,   -- 公积金补贴5%
  0.02,   -- 养老金补贴3%
  0.04,   -- 社保补贴2%
  7.5,    -- 1倍加班按8小时/天计算
  173,    -- 1倍加班费系数（日常加班）
  29,    -- 额外加班1档每天最多4小时
  173,    -- 额外加班1档系数（周末加班）
  8,    -- 额外加班2档每天最多2小时
  20,    -- 额外加班2档系数（法定假日加班）
  12,    -- 额外加班3档每天最多1小时
  20,    -- 额外加班3档系数（深夜加班）
  0.0689,   -- 公积金扣除8%
  0.03,   -- 养老金扣除6%
  0.05,    -- 社保扣除5%
  100400
);